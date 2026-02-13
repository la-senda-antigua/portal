using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using lsa_web_apis.Controllers;
using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace lsa_web_apis.Tests.Controllers;

public class CalendarsEventsTests
{
    private class UserAvailabilityResult
    {
        public CalendarMemberDto user { get; set; }
        public List<CalendarDto> conflicts { get; set; }
    }

    private UserDbContext GetContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<UserDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new UserDbContext(options);
    }

    [Fact]
    public async Task UserAvailability_Scenario1_NoConflict_DifferentDates()
    {
        // Scenario 1
        // Event created for User A, March 10th from 10:00 to 13:00
        // New event created for User A, March 11th from 10:00 to 11:00
        // Expected result: no conflicts

        using var context = GetContext("Scenario1");
        var controller = new CalendarsController(context);

        var userA = new User { Id = Guid.NewGuid(), Username = "UserA", Name = "User", LastName = "A" };
        context.PortalUsers.Add(userA);
        
        var calendar = new Calendar { Id = Guid.NewGuid(), Name = "Calendar1", Active = true };
        context.Calendars.Add(calendar);

        var eventA = new CalendarEvent
        {
            Id = Guid.NewGuid(),
            CalendarId = calendar.Id,
            Title = "Event A",
            StartTime = "2026-03-10 10:00:00",
            EndTime = "2026-03-10 13:00:00"
        };
        context.CalendarEvents.Add(eventA);
        context.CalendarEventAssignees.Add(new CalendarEventAssignee { CalendarEventId = eventA.Id, UserId = userA.Id });
        
        await context.SaveChangesAsync();

        var request = new CalendarsController.UserAvailabilityRequest(
            new[] { userA.Id.ToString() },
            "2026-03-11 10:00:00",
            "2026-03-11 11:00:00"
        );

        var result = await controller.UserAvailability(request);
        var okResult = Assert.IsType<OkObjectResult>(result);
        var data = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
        
        Assert.Empty(data);
    }

    [Fact]
    public async Task UserAvailability_Scenario2_Conflict_InsideRange()
    {
        // Scenario 2
        // Event created for User A, March 10th from 10:00 to 13:00
        // New event created for User A, March 10th from 11:00 to 11:30
        // Expected result: conflict should exist

        using var context = GetContext("Scenario2");
        var controller = new CalendarsController(context);

        var userA = new User { Id = Guid.NewGuid(), Username = "UserA", Name = "User", LastName = "A" };
        context.PortalUsers.Add(userA);
        
        var calendar = new Calendar { Id = Guid.NewGuid(), Name = "Calendar1", Active = true };
        context.Calendars.Add(calendar);

        var eventA = new CalendarEvent
        {
            Id = Guid.NewGuid(),
            CalendarId = calendar.Id,
            Title = "Event A",
            StartTime = "2026-03-10 10:00:00",
            EndTime = "2026-03-10 13:00:00"
        };
        context.CalendarEvents.Add(eventA);
        context.CalendarEventAssignees.Add(new CalendarEventAssignee { CalendarEventId = eventA.Id, UserId = userA.Id });
        
        await context.SaveChangesAsync();

        var request = new CalendarsController.UserAvailabilityRequest(
            new[] { userA.Id.ToString() },
            "2026-03-10T11:00:00",
            "2026-03-10T11:30:00"
        );

        var result = await controller.UserAvailability(request);
        var okResult = Assert.IsType<OkObjectResult>(result);
        var json = JsonSerializer.Serialize(okResult.Value);
        var dataList = JsonSerializer.Deserialize<List<UserAvailabilityResult>>(json);

        Assert.Single(dataList);
        Assert.Equal(userA.Id, dataList[0].user.UserId);
        Assert.Single(dataList[0].conflicts);
    }

    [Fact]
    public async Task UserAvailability_Scenario3_NoConflict_DifferentUser()
    {
        // Scenario 3
        // Event created for User A, March 10th from 10:00 to 13:00
        // New event created for User B, March 10th from 11:00 to 11:30
        // Expected result: no conflict

        using var context = GetContext("Scenario3");
        var controller = new CalendarsController(context);

        var userA = new User { Id = Guid.NewGuid(), Username = "UserA", Name = "User", LastName = "A" };
        var userB = new User { Id = Guid.NewGuid(), Username = "UserB", Name = "User", LastName = "B" };
        context.PortalUsers.AddRange(userA, userB);
        
        var calendar = new Calendar { Id = Guid.NewGuid(), Name = "Calendar1", Active = true };
        context.Calendars.Add(calendar);

        var eventA = new CalendarEvent
        {
            Id = Guid.NewGuid(),
            CalendarId = calendar.Id,
            Title = "Event A",
            StartTime = "2026-03-10 10:00:00",
            EndTime = "2026-03-10 13:00:00"
        };
        context.CalendarEvents.Add(eventA);
        context.CalendarEventAssignees.Add(new CalendarEventAssignee { CalendarEventId = eventA.Id, UserId = userA.Id });
        
        await context.SaveChangesAsync();

        var request = new CalendarsController.UserAvailabilityRequest(
            new[] { userB.Id.ToString() },
            "2026-03-10 11:00:00",
            "2026-03-10 11:30:00"
        );

        var result = await controller.UserAvailability(request);
        var okResult = Assert.IsType<OkObjectResult>(result);
        var data = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
        
        Assert.Empty(data);
    }

    [Fact]
    public async Task UserAvailability_Scenario5_Conflict_LongEvent()
    {
        // Scenario 5
        // Event created for User A, March 10th from 10:00 to March 13th 10:00
        // New event created for User A, March 11th from 11:00 to 13:00
        // Expected result: conflict should exist

        using var context = GetContext("Scenario5");
        var controller = new CalendarsController(context);

        var userA = new User { Id = Guid.NewGuid(), Username = "UserA", Name = "User", LastName = "A" };
        context.PortalUsers.Add(userA);
        
        var calendar = new Calendar { Id = Guid.NewGuid(), Name = "Calendar1", Active = true };
        context.Calendars.Add(calendar);

        var eventA = new CalendarEvent
        {
            Id = Guid.NewGuid(),
            CalendarId = calendar.Id,
            Title = "Event A",
            StartTime = "2026-03-10 10:00:00",
            EndTime = "2026-03-13 10:00:00"
        };
        context.CalendarEvents.Add(eventA);
        context.CalendarEventAssignees.Add(new CalendarEventAssignee { CalendarEventId = eventA.Id, UserId = userA.Id });
        
        await context.SaveChangesAsync();

        var request = new CalendarsController.UserAvailabilityRequest(
            new[] { userA.Id.ToString() },
            "2026-03-11 11:00:00",
            "2026-03-11 13:00:00"
        );

        var result = await controller.UserAvailability(request);
        var okResult = Assert.IsType<OkObjectResult>(result);
        var json = JsonSerializer.Serialize(okResult.Value);
        var dataList = JsonSerializer.Deserialize<List<UserAvailabilityResult>>(json);

        Assert.Single(dataList);
        Assert.Equal(userA.Id, dataList[0].user.UserId);
    }
}