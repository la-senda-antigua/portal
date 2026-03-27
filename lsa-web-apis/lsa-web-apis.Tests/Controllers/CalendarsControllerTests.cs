using System;
using System.Security.Claims;
using lsa_web_apis.Controllers;
using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace lsa_web_apis.Tests.Controllers;

public class CalendarsControllerTests
{

    [Fact]
    public async Task GetAll_Calendars()
    {
        var options = new DbContextOptionsBuilder<UserDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDatabase")
            .Options;

        using var context = new UserDbContext(options);

        context.Calendars.AddRange(
            new Calendar { Id = Guid.NewGuid(), Name = "Calendar 1", Active = true },
            new Calendar { Id = Guid.NewGuid(), Name = "Calendar 2", Active = false }
        );
        await context.SaveChangesAsync();

        var controller = new CalendarsController(context, Helpers.MockFirebaseNotificationService.GetMock(), NullLogger<CalendarsController>.Instance);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] { new Claim(ClaimTypes.Role, "Admin") }, "mock"));

        controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };

        var result = await controller.GetAll();
        var actionResult = Assert.IsType<ActionResult<List<Calendar>>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var calendars = Assert.IsType<List<Calendar>>(okResult.Value);
        Assert.Equal(2, calendars.Count);
    }

    [Fact]
    public async Task Add_Calendar()
    {
        var options = new DbContextOptionsBuilder<UserDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDatabase_Add")
            .Options;

        using var context = new UserDbContext(options);
        var controller = new CalendarsController(context, Helpers.MockFirebaseNotificationService.GetMock(), NullLogger<CalendarsController>.Instance);

        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] { new Claim(ClaimTypes.Role, "Admin") }, "mock"));

        controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };

        var newCalendarDto = new CalendarDto { Name = "New Calendar", Active = true };
        var result = await controller.Add(newCalendarDto);

        var actionResult = Assert.IsType<ActionResult<Calendar>>(result);
        var createdResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
        var calendar = Assert.IsType<Calendar>(createdResult.Value);

        Assert.Equal("New Calendar", calendar.Name);
        Assert.True(calendar.Active);
        Assert.NotEqual(Guid.Empty, calendar.Id);
    }

    [Fact]
    public async Task Edit_Calendar()
    {
        var options = new DbContextOptionsBuilder<UserDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDatabase_Edit")
            .Options;

        using var context = new UserDbContext(options);

        var existingCalendarId = Guid.NewGuid();
        context.Calendars.Add(new Calendar
        {
            Id = existingCalendarId,
            Name = "Old Name",
            Active = true
        });
        await context.SaveChangesAsync();

        var controller = new CalendarsController(context, Helpers.MockFirebaseNotificationService.GetMock(), NullLogger<CalendarsController>.Instance);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] { new Claim(ClaimTypes.Role, "Admin") }, "mock"));

        controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };

        var updateDto = new CalendarDto { Name = "Updated Calendar", Active = false };
        var result = await controller.Edit(existingCalendarId, updateDto);

        var actionResult = Assert.IsType<ActionResult<Calendar>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var calendar = Assert.IsType<Calendar>(okResult.Value);

        Assert.Equal("Updated Calendar", calendar.Name);
        Assert.False(calendar.Active);
        Assert.Equal(existingCalendarId, calendar.Id);
    }

    [Fact]
    public async Task Edit_Calendar_Promotes_User_To_CalendarManager()
    {
        var options = new DbContextOptionsBuilder<UserDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDatabase_Edit_Promotion_{Guid.NewGuid()}")
            .Options;

        using var context = new UserDbContext(options);

        // Create a calendar 
        var existingCalendarId = Guid.NewGuid();
        context.Calendars.Add(new Calendar
        {
            Id = existingCalendarId,
            Name = "Original Calendar",
            Active = true
        });

        var userId = Guid.NewGuid();
        context.PortalUsers.Add(new User 
        { 
            Id = userId, 
            Username = "test@user.com", 
            Role = "User",
            Name = "Test",
            LastName = "User"
        });
        // Add user as a member
        context.CalendarMembers.Add(new CalendarMember
        {
            CalendarId = existingCalendarId,
            UserId = userId
        });
        await context.SaveChangesAsync();

        var controller = new CalendarsController(context, Helpers.MockFirebaseNotificationService.GetMock(), NullLogger<CalendarsController>.Instance);
        var adminUser = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] { 
            new Claim(ClaimTypes.Role, "Admin"),
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString())
        }, "mock"));
        controller.ControllerContext = new ControllerContext() { HttpContext = new DefaultHttpContext() { User = adminUser } };

        // Edit calendar and update 
        var updateDto = new CalendarDto { Name = "Updated Calendar", Managers = new List<Guid> { userId } };
        await controller.Edit(existingCalendarId, updateDto);

        var updatedUser = await context.PortalUsers.FindAsync(userId);
        Assert.NotNull(updatedUser);
        var roles = updatedUser.Role.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(r => r.Trim()).ToList();
        Assert.Contains("User", roles);
        Assert.Contains("CalendarManager", roles);
    }

    [Fact]
    public async Task Delete_Calendar()
    {
        var options = new DbContextOptionsBuilder<UserDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDatabase_Delete")
            .Options;

        using var context = new UserDbContext(options);

        var existingCalendarId = Guid.NewGuid();
        context.Calendars.Add(new Calendar
        {
            Id = existingCalendarId,
            Name = "To Delete",
            Active = true
        });
        await context.SaveChangesAsync();

        var controller = new CalendarsController(context, Helpers.MockFirebaseNotificationService.GetMock(), NullLogger<CalendarsController>.Instance);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] { new Claim(ClaimTypes.Role, "Admin") }, "mock"));
        controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };

        var result = await controller.Delete(existingCalendarId);

        Assert.IsType<NoContentResult>(result);
        Assert.Null(await context.Calendars.FindAsync(existingCalendarId));
    }

    [Fact]
    public async Task GetByUsername_ReturnsUserCalendars()
    {
        var options = new DbContextOptionsBuilder<UserDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDatabase_GetByUser")
            .Options;

        using var context = new UserDbContext(options);

        var userOne = new User { Username = "testuser@test.com", Name = "Test", LastName = "User", Role = "User", Id = Guid.NewGuid() };
        var userTwo = new User { Username = "testuser2@test.com", Name = "Test2", LastName = "User2", Role = "User", Id = Guid.NewGuid() };

        var calendar1Id = Guid.NewGuid();
        var calendar2Id = Guid.NewGuid();
        var calendar1 = new Calendar { Id = calendar1Id, Name = "Calendar 1", Active = true };
        var calendar2 = new Calendar { Id = calendar2Id, Name = "Calendar 2", Active = true };

        context.Calendars.AddRange(calendar1, calendar2);
        await context.SaveChangesAsync();

        context.CalendarManagers.Add(new CalendarManager
        {
            CalendarId = calendar1Id,
            UserId = userOne.Id,
            User = userOne,
        });
        context.CalendarMembers.Add(new CalendarMember
        {
            CalendarId = calendar2Id,
            UserId = userTwo.Id,
            User = userTwo,
        });
        await context.SaveChangesAsync();

        var controller = new CalendarsController(context, Helpers.MockFirebaseNotificationService.GetMock(), NullLogger<CalendarsController>.Instance);

        var requestUser = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
        new(ClaimTypes.NameIdentifier, userOne.Id.ToString()),
        new(ClaimTypes.Role, "Admin"),
        new(ClaimTypes.Name, userOne.Username)
        }, "mock"));

        controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = requestUser }
        };

        var result = await controller.GetByUsername();
        var actionResult = Assert.IsType<ActionResult<List<CalendarDto>>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var calendars = Assert.IsType<List<CalendarDto>>(okResult.Value);

        Assert.Equal(2, calendars.Count);
        Assert.Contains(calendars, c => c.Id == calendar1Id);
        Assert.Contains(calendars, c => c.Id == calendar2Id);
    }
}
