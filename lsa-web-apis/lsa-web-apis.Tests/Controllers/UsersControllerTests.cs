using lsa_web_apis.Controllers;
using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Models;
using lsa_web_apis.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace lsa_web_apis.Tests.Controllers;

public class UsersControllerTests
{
    [Fact]
    public async Task GetUsers_Test()
    {
        var options = new DbContextOptionsBuilder<UserDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDatabase")
            .Options;

        using var context = new UserDbContext(options);

        var mockAuthService = new Mock<IAuthService>();

        context.PortalUsers.AddRange(
            new User { Id = Guid.NewGuid(), Username = "user1", Role = "User" },
            new User { Id = Guid.NewGuid(), Username = "user2", Role = "Admin" }
        );
        await context.SaveChangesAsync();

        var controller = new UsersController(mockAuthService.Object, context);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] { new Claim(ClaimTypes.Role, "Admin") }, "mock"));

        controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };

        var result = await controller.GetUsers(page: 1, pageSize: 10);

        var actionResult = Assert.IsType<ActionResult<PagedResult<UserDto>>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var pagedResult = Assert.IsType<PagedResult<UserDto>>(okResult.Value);
        Assert.Equal(2, pagedResult.Items.Count());
    }

    [Fact]
    public async Task RegisterUser_Without_Calendars_Test()
    {
        var options = new DbContextOptionsBuilder<UserDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDatabase_Register")
            .ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        using var context = new UserDbContext(options);
        var mockAuthService = new Mock<IAuthService>();
        var newUser = new User { Id = Guid.NewGuid(), Username = "newuser", Role = "User" };
        mockAuthService.Setup(x => x.RegisterAsync("newuser", "User")).ReturnsAsync(newUser);

        var controller = new UsersController(mockAuthService.Object, context);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] { new Claim(ClaimTypes.Role, "Admin") }, "mock"));
        controller.ControllerContext = new ControllerContext() { HttpContext = new DefaultHttpContext() { User = user } };

        var userDto = new UserDto { Username = "newuser", Role = "User" };
        var result = await controller.Register(userDto);

        var actionResult = Assert.IsType<ActionResult<User>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
    }

    [Fact]
    public async Task RegisterUser_WithCalendars_Test()
    {
        var options = new DbContextOptionsBuilder<UserDbContext>()
            .UseInMemoryDatabase(databaseName: "Register_ManagerCalendars")
            .ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        using var context = new UserDbContext(options);
        var mockAuthService = new Mock<IAuthService>();

        var calendarId1 = Guid.NewGuid();
        var calendarId2 = Guid.NewGuid();
        var calendarId3 = Guid.NewGuid();
        context.Calendars.Add(new Calendar { Id = calendarId1, Name = "Test Calendar", Active = true });
        context.Calendars.Add(new Calendar { Id = calendarId2, Name = "Test Calendar2", Active = true });
        context.Calendars.Add(new Calendar { Id = calendarId3, Name = "Test Calendar3", Active = true });
        await context.SaveChangesAsync();

        var newUser = new User { Id = Guid.NewGuid(), Username = "calendar_manager_name", Role = "CalendarManager" };
        mockAuthService.Setup(x => x.RegisterAsync("calendar_manager_name", "CalendarManager")).ReturnsAsync(newUser);

        var controller = new UsersController(mockAuthService.Object, context);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] { new Claim(ClaimTypes.Role, "Admin") }, "mock"));
        controller.ControllerContext = new ControllerContext() { HttpContext = new DefaultHttpContext() { User = user } };

        var userDto = new UserDto
        {
            Username = "calendar_manager_name",
            Role = "CalendarManager",
            CalendarsAsManager = new List<CalendarDto>
            {
                new CalendarDto { Id = calendarId1, Name = "Test Calendar", Active = true },
                new CalendarDto { Id = calendarId2, Name = "Test Calendar2", Active = true },
            },
            CalendarsAsMember = new List<CalendarDto>()
            {
                new CalendarDto { Id = calendarId3, Name = "Test Calendar3", Active = true },                
            }
        };
        var result = await controller.Register(userDto);
        var actionResult = Assert.IsType<ActionResult<User>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        Assert.Equal("calendar_manager_name", ((User)okResult.Value!).Username);        
    }

    [Fact]
    public async Task UpdateUser_Test()
    {
        var options = new DbContextOptionsBuilder<UserDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDatabase_UpdateUser")
            .ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        using var context = new UserDbContext(options);
        var mockAuthService = new Mock<IAuthService>();

        var userId = Guid.NewGuid();
        context.PortalUsers.Add(new User { Id = userId, Username = "olduser", Role = "User" });
        await context.SaveChangesAsync();

        var controller = new UsersController(mockAuthService.Object, context);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] { new Claim(ClaimTypes.Role, "Admin") }, "mock"));
        controller.ControllerContext = new ControllerContext() { HttpContext = new DefaultHttpContext() { User = user } };

        var updateDto = new UserDto { Username = "olduser", Role = "Admin" };
        var result = await controller.UpdateUser(userId, updateDto);

        var actionResult = Assert.IsType<ActionResult<User>>(result);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var userResult = Assert.IsType<User>(okResult.Value);
        Assert.Equal("Admin", userResult.Role);
    }

    [Fact]
    public async Task DeleteUser_Test()
    {
        var options = new DbContextOptionsBuilder<UserDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDatabase_DeleteUser")
            .Options;

        using var context = new UserDbContext(options);
        var mockAuthService = new Mock<IAuthService>();

        var userId = Guid.NewGuid();
        context.PortalUsers.Add(new User { Id = userId, Username = "testUser", Role = "User" });
        await context.SaveChangesAsync();

        var controller = new UsersController(mockAuthService.Object, context);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] { new Claim(ClaimTypes.Role, "Admin") }, "mock"));
        controller.ControllerContext = new ControllerContext() { HttpContext = new DefaultHttpContext() { User = user } };

        var result = await controller.DeleteUser(userId);

        Assert.IsType<NoContentResult>(result);
        Assert.Null(await context.PortalUsers.FindAsync(userId));
    }

}

