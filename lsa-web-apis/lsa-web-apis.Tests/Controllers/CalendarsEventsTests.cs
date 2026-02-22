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

    [Fact]
    public async Task UserAvailability_Scenario_ConflictWithOneOfTwoUsers()
    {
        // Scenario 6
        // Event1 assigned to User A and User B on March 11th from 10:00 to 11:00.
        // We check for availability for a new event for User B on March 11th from 10:30 to 11:30.
        // Expected result: User B has a conflict.

        using var context = GetContext("Scenario_ConflictWithOneOfTwoUsers");
        var controller = new CalendarsController(context);

        var userA = new User { Id = Guid.NewGuid(), Username = "UserA", Name = "User", LastName = "A" };
        var userB = new User { Id = Guid.NewGuid(), Username = "UserB", Name = "User", LastName = "B" };
        var userC = new User { Id = Guid.NewGuid(), Username = "UserC", Name = "User", LastName = "C" };
        context.PortalUsers.AddRange(userA, userB, userC);
        
        var calendar = new Calendar { Id = Guid.NewGuid(), Name = "Calendar1", Active = true };
        context.Calendars.Add(calendar);

        var event1 = new CalendarEvent
        {
            Id = Guid.NewGuid(),
            CalendarId = calendar.Id,
            Title = "Event 1",
            StartTime = "2026-03-11 10:00:00",
            EndTime = "2026-03-11 11:00:00"
        };
        context.CalendarEvents.Add(event1);
        context.CalendarEventAssignees.Add(new CalendarEventAssignee { CalendarEventId = event1.Id, UserId = userA.Id });
        context.CalendarEventAssignees.Add(new CalendarEventAssignee { CalendarEventId = event1.Id, UserId = userB.Id });
        context.CalendarEventAssignees.Add(new CalendarEventAssignee { CalendarEventId = event1.Id, UserId = userC.Id });
        
        await context.SaveChangesAsync();

        // Check availability for User B for a new event on March 11th from 10:30 to 11:30
        var request = new CalendarsController.UserAvailabilityRequest(
            new[] { userB.Id.ToString() },
            "2026-03-11 10:30:00",
            "2026-03-11 11:30:00"
        );

        var result = await controller.UserAvailability(request);
        var okResult = Assert.IsType<OkObjectResult>(result);
        var json = JsonSerializer.Serialize(okResult.Value);
        var dataList = JsonSerializer.Deserialize<List<UserAvailabilityResult>>(json);

        Assert.Single(dataList);
        Assert.Equal(userB.Id, dataList[0].user.UserId);
        Assert.Single(dataList[0].conflicts);
    }

    [Fact]
    public async Task UserAvailability_Scenario_ComplexConflicts()
    {
        // Scenario
        // Event 1 is assigned to 5 users.
        // Event 2 is assigned to 3 users.
        // We check for availability for a new event that conflicts with Event 1.
        // Expected result: 2 users should have conflicts.

        using var context = GetContext("Scenario_ComplexConflicts");
        var controller = new CalendarsController(context);

        // Create users
        var user1 = new User { Id = Guid.NewGuid(), Username = "User1", Name = "User", LastName = "1" };
        var user2 = new User { Id = Guid.NewGuid(), Username = "User2", Name = "User", LastName = "2" };
        var user3 = new User { Id = Guid.NewGuid(), Username = "User3", Name = "User", LastName = "3" };
        var user4 = new User { Id = Guid.NewGuid(), Username = "User4", Name = "User", LastName = "4" };
        var user5 = new User { Id = Guid.NewGuid(), Username = "User5", Name = "User", LastName = "5" };
        var user6 = new User { Id = Guid.NewGuid(), Username = "User6", Name = "User", LastName = "6" };
        var user7 = new User { Id = Guid.NewGuid(), Username = "User7", Name = "User", LastName = "7" };
        context.PortalUsers.AddRange(user1, user2, user3, user4, user5, user6, user7);
        
        var calendar = new Calendar { Id = Guid.NewGuid(), Name = "Calendar1", Active = true };
        context.Calendars.Add(calendar);

        // Event 1 with 5 assignees
        var event1 = new CalendarEvent
        {
            Id = Guid.NewGuid(),
            CalendarId = calendar.Id,
            Title = "Event 1",
            StartTime = "2026-03-12 09:00:00",
            EndTime = "2026-03-12 11:00:00"
        };
        context.CalendarEvents.Add(event1);
        context.CalendarEventAssignees.AddRange(
            new CalendarEventAssignee { CalendarEventId = event1.Id, UserId = user1.Id },
            new CalendarEventAssignee { CalendarEventId = event1.Id, UserId = user2.Id },
            new CalendarEventAssignee { CalendarEventId = event1.Id, UserId = user3.Id },
            new CalendarEventAssignee { CalendarEventId = event1.Id, UserId = user4.Id },
            new CalendarEventAssignee { CalendarEventId = event1.Id, UserId = user5.Id }
        );

        // Event 2 with 3 assignees
        var event2 = new CalendarEvent
        {
            Id = Guid.NewGuid(),
            CalendarId = calendar.Id,
            Title = "Event 2",
            StartTime = "2026-03-12 14:00:00",
            EndTime = "2026-03-12 16:00:00"
        };
        context.CalendarEvents.Add(event2);
        context.CalendarEventAssignees.AddRange(
            new CalendarEventAssignee { CalendarEventId = event2.Id, UserId = user5.Id },
            new CalendarEventAssignee { CalendarEventId = event2.Id, UserId = user6.Id },
            new CalendarEventAssignee { CalendarEventId = event2.Id, UserId = user7.Id }
        );
        
        await context.SaveChangesAsync();

        // Check availability for User1, User2, and User6 for a new event that overlaps with Event 1
        var request = new CalendarsController.UserAvailabilityRequest(
            new[] { user1.Id.ToString(), user2.Id.ToString(), user6.Id.ToString() },
            "2026-03-12 10:00:00",
            "2026-03-12 12:00:00"
        );

        var result = await controller.UserAvailability(request);
        var okResult = Assert.IsType<OkObjectResult>(result);
        var json = JsonSerializer.Serialize(okResult.Value);
        var dataList = JsonSerializer.Deserialize<List<UserAvailabilityResult>>(json);

        // We expect 2 users (User1 and User2) to have conflicts.
        Assert.Equal(2, dataList.Count);
        Assert.Contains(dataList, d => d.user.UserId == user1.Id);
        Assert.Contains(dataList, d => d.user.UserId == user2.Id);
        Assert.DoesNotContain(dataList, d => d.user.UserId == user6.Id);
    }
}