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

        var utcTime = new DateTime(2026, 1, 1, 15, 30, 0, DateTimeKind.Utc); // 3:30 PM
        var publicEvent = new PublicEvent
        {
            Title = "Test Event",
            StartTime = utcTime.ToString("yyyy-MM-dd HH:mm:ss"),
            EndTime = utcTime.AddHours(2).ToString("yyyy-MM-dd HH:mm:ss")
        };

        var result = await controller.CreateEvent(publicEvent);
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var returnedEvent = Assert.IsType<PublicEvent>(createdResult.Value);

        Assert.True(DateTime.TryParse(returnedEvent.StartTime, out DateTime parsedStartTime));
        Assert.Equal(15, parsedStartTime.Hour);
        Assert.Equal(30, parsedStartTime.Minute);
        
        Assert.True(DateTime.TryParse(returnedEvent.EndTime, out DateTime parsedEndTime));
        Assert.Equal(17, parsedEndTime.Hour); // 15 + 2 hours
        Assert.Equal(30, parsedEndTime.Minute);
    }

}
