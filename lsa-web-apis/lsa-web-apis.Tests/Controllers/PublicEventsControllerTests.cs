using System;
using System.Security.Claims;
using lsa_web_apis.Controllers;
using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace lsa_web_apis.Tests.Controllers;

public class PublicEventsControllerTests
{
    [Fact]
    public async Task CreateEvent_ShouldPreserveExactTime()
    {
        var options = new DbContextOptionsBuilder<PublicEventsDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDatabase_CreateEvent")
            .Options;

        using var context = new PublicEventsDbContext(options);

        var controller = new PublicEventsController(context);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        { new Claim(ClaimTypes.Role, "Admin")}, "mock"));

        controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };

        var utcTime = new DateTime(2026, 1, 1, 15, 30, 0, DateTimeKind.Utc); // 3:30 PM UTC
        var publicEvent = new PublicEvent
        {
            Title = "Test Event",
            StartTime = utcTime,
            EndTime = utcTime.AddHours(2)
        };

        var result = await controller.CreateEvent(publicEvent);
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var returnedEvent = Assert.IsType<PublicEvent>(createdResult.Value);

        Assert.Equal(15, returnedEvent.StartTime.Hour);
        Assert.Equal(30, returnedEvent.StartTime.Minute);
        // Kind should be the same as input
        Assert.Equal(DateTimeKind.Unspecified, returnedEvent.StartTime.Kind);
    }
}
