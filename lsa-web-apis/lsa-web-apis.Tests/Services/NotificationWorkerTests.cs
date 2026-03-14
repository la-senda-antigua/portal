using System.Reflection;
using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace lsa_web_apis.Tests.Services;

public class NotificationWorkerTests
{
    [Fact]
    public async Task ProcessNotifications_SameUsernameInAssignees_CreatesOnlyOneNotificationLog()
    {
        var options = new DbContextOptionsBuilder<UserDbContext>()
            .UseInMemoryDatabase(databaseName: $"NotificationWorkerTests_{Guid.NewGuid():N}")
            .Options;

        await using var context = new UserDbContext(options);

        var sharedUsername = "shared-account@example.com";
        var eventId = Guid.NewGuid();
        var calendarId = Guid.NewGuid();
        var targetStart = DateTime.Now.AddDays(14).ToString("yyyy-MM-dd 10:00:00");

        var user1 = new User { Id = Guid.NewGuid(), Username = sharedUsername, Name = "Pedro", LastName = "A", Role = "User", RowId = 1 };
        var user2 = new User { Id = Guid.NewGuid(), Username = sharedUsername, Name = "Maria", LastName = "B", Role = "User", RowId = 2 };
        var user3 = new User { Id = Guid.NewGuid(), Username = sharedUsername, Name = "Juan", LastName = "C", Role = "User", RowId = 3 };

        var calendar = new Calendar
        {
            Id = calendarId,
            Name = "Eventos Familia",
            Active = true,
            IsHidden = false
        };

        var calendarEvent = new CalendarEvent
        {
            Id = eventId,
            CalendarId = calendarId,
            Title = "Reunion",
            StartTime = targetStart,
            EndTime = targetStart
        };

        context.PortalUsers.AddRange(user1, user2, user3);
        context.Calendars.Add(calendar);
        context.CalendarEvents.Add(calendarEvent);
        context.CalendarEventAssignees.AddRange(
            new CalendarEventAssignee { CalendarEventId = eventId, UserId = user1.Id },
            new CalendarEventAssignee { CalendarEventId = eventId, UserId = user2.Id },
            new CalendarEventAssignee { CalendarEventId = eventId, UserId = user3.Id }
        );

        await context.SaveChangesAsync();

        var firebaseMock = new Mock<IFirebaseNotificationService>();

        var serviceProviderMock = new Mock<IServiceProvider>();
        serviceProviderMock
            .Setup(p => p.GetService(typeof(UserDbContext)))
            .Returns(context);

        var scopeMock = new Mock<IServiceScope>();
        scopeMock.SetupGet(s => s.ServiceProvider).Returns(serviceProviderMock.Object);

        var scopeFactoryMock = new Mock<IServiceScopeFactory>();
        scopeFactoryMock
            .Setup(f => f.CreateScope())
            .Returns(scopeMock.Object);

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["NotificationWorker:IntervalHours"] = "1"
            })
            .Build();

        var worker = new NotificationWorker(
            NullLogger<NotificationWorker>.Instance,
            scopeFactoryMock.Object,
            firebaseMock.Object,
            configuration);

        var processMethod = typeof(NotificationWorker)
            .GetMethod("ProcessNotifications", BindingFlags.NonPublic | BindingFlags.Instance);

        Assert.NotNull(processMethod);
        await (Task)processMethod!.Invoke(worker, new object[] { CancellationToken.None })!;

        firebaseMock.Verify(
            f => f.SendMulticastAsync(
                It.IsAny<IEnumerable<string>>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()),
            Times.Never);

        var logs = await context.NotificationLogs
            .Where(n => n.EventId == eventId && n.Username == sharedUsername.ToLowerInvariant() && n.NotificationType == "14DayReminder")
            .ToListAsync();

        Assert.Single(logs);
    }
}