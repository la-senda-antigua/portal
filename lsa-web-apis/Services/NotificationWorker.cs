using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using Microsoft.EntityFrameworkCore;

namespace lsa_web_apis.Services
{
    public class NotificationWorker : BackgroundService
    {
        private readonly ILogger<NotificationWorker> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IFirebaseNotificationService _firebaseNotificationService;
        private readonly TimeSpan _notificationInterval;

        public NotificationWorker(
            ILogger<NotificationWorker> logger,
            IServiceScopeFactory scopeFactory,
            IFirebaseNotificationService firebaseNotificationService,
            IConfiguration configuration)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
            _firebaseNotificationService = firebaseNotificationService;

            var configuredHours = configuration.GetValue<int?>("NotificationWorker:IntervalHours");
            var intervalHours = configuredHours.GetValueOrDefault(1);
            if (intervalHours <= 0)
            {
                intervalHours = 1;
            }

            _notificationInterval = TimeSpan.FromHours(intervalHours);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Notification Worker started. Interval: {Hours} hour(s)", _notificationInterval.TotalHours);
            while (!stoppingToken.IsCancellationRequested)
            {
                await ProcessNotifications(stoppingToken);
                await Task.Delay(_notificationInterval, stoppingToken);
            }
        }

        private async Task ProcessNotifications(CancellationToken stoppingToken)
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<UserDbContext>();

            try
            {
                var targetDate = DateTime.Now.AddDays(14);
                var targetDateStringStart = targetDate.ToString("yyyy-MM-dd");
                var targetDateStringEnd = targetDate.ToString("yyyy-MM-dd") + " 23:59:59";
                var notificationType = "14DayReminder";

                var events = await dbContext.CalendarEvents
                    .Include(e => e.Calendar)
                    .Include(e => e.Assignees)
                    .ThenInclude(a => a.User)
                    .Where(e => e.Calendar.IsHidden == false &&
                                e.StartTime != null &&
                                e.StartTime.CompareTo(targetDateStringStart) >= 0 &&
                                e.StartTime.CompareTo(targetDateStringEnd) <= 0)
                    .ToListAsync(stoppingToken);

                if (!events.Any())
                {
                    _logger.LogInformation("No upcoming events to notify ({TargetDate})", targetDate.ToShortDateString());
                    return;
                }

                int totalSent = 0;
                int totalFailed = 0;
                var pendingLogKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                foreach (var calendarEvent in events)
                {
                    if (!DateTime.TryParse(calendarEvent.StartTime, out var eventDate))
                    {
                        _logger.LogWarning("Could not parse StartTime for event {EventId}", calendarEvent.Id);
                        continue;
                    }

                    foreach (var assignee in calendarEvent.Assignees)
                    {
                        var user = assignee.User;
                        if (user == null || string.IsNullOrEmpty(user.Username)) continue;

                        var normalizedUsername = user.Username.Trim().ToLowerInvariant();
                        if (string.IsNullOrEmpty(normalizedUsername)) continue;
                        
                        var pendingKey = $"{calendarEvent.Id:N}|{normalizedUsername}|{notificationType}";
                        if (pendingLogKeys.Contains(pendingKey)) continue;

                        var claimedForSend = await TryCreateNotificationLogAsync(
                            dbContext,
                            calendarEvent.Id,
                            normalizedUsername,
                            notificationType,
                            stoppingToken
                        );

                        if (!claimedForSend) continue;

                        pendingLogKeys.Add(pendingKey);

                        var userDevices = await dbContext.UserDevices
                            .Where(d => d.Username.ToLower() == normalizedUsername)
                            .Select(d => d.FirebaseToken)
                            .ToListAsync(stoppingToken);

                        if (!userDevices.Any())
                        {
                            _logger.LogWarning("User {Username} has no registered devices to notify (event {EventId})", normalizedUsername, calendarEvent.Id);
                        }
                        else
                        {
                            var body = $"{calendarEvent.Calendar.Name} - {eventDate:MMMM dd}";
                            if (!string.IsNullOrWhiteSpace(calendarEvent.Title))
                            {
                                body = $"{calendarEvent.Title}\n{body}";
                            }

                            var response = await _firebaseNotificationService.SendMulticastAsync(
                                userDevices,
                                $"{user.Name} {user.LastName}",
                                body,
                                stoppingToken
                            );
                            totalSent += response.SuccessCount;
                            totalFailed += response.FailureCount;

                            if (response.FailureCount > 0)
                            {
                                var failedTokens = response.Responses
                                    .Where(r => !r.IsSuccess)
                                    .Select((r, i) => userDevices[i])
                                    .ToList();

                                _logger.LogWarning("Failed to send to {FailureCount} tokens for user {Username}.", failedTokens.Count, user.Username);

                                var devicesToRemove = await dbContext.UserDevices
                                    .Where(d => d.Username.ToLower() == normalizedUsername && failedTokens.Contains(d.FirebaseToken))
                                    .ToListAsync(stoppingToken);

                                if(devicesToRemove.Any())
                                {
                                    dbContext.UserDevices.RemoveRange(devicesToRemove);
                                    await dbContext.SaveChangesAsync(stoppingToken);
                                }
                            }
                        }
                    }
                }

                _logger.LogInformation("Notifications sent: {TotalOk}, failed: {TotalFail}", totalSent, totalFailed);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing push notifications.");
            }
        }

        private async Task<bool> TryCreateNotificationLogAsync(
            UserDbContext dbContext,
            Guid eventId,
            string normalizedUsername,
            string notificationType,
            CancellationToken stoppingToken)
        {
            dbContext.NotificationLogs.Add(new NotificationLog
            {
                EventId = eventId,
                Username = normalizedUsername,
                NotificationType = notificationType,
                SentAt = DateTime.Now
            });

            try
            {
                await dbContext.SaveChangesAsync(stoppingToken);
                return true;
            }
            catch (DbUpdateException ex) when (IsDuplicateNotificationLogConstraintViolation(ex))
            {
                var duplicateNotificationEntries = ex.Entries
                    .Where(e => e.Entity is NotificationLog)
                    .ToList();

                foreach (var entry in duplicateNotificationEntries)
                {
                    entry.State = EntityState.Detached;
                }

                _logger.LogInformation(
                    "Skipping duplicate reminder for event {EventId}, username {Username}, type {Type}.",
                    eventId,
                    normalizedUsername,
                    notificationType
                );

                return false;
            }
        }

        private static bool IsDuplicateNotificationLogConstraintViolation(DbUpdateException ex)
        {
            var message = ex.InnerException?.Message;
            return !string.IsNullOrWhiteSpace(message)
                   && message.Contains("Duplicate entry", StringComparison.OrdinalIgnoreCase)
                   && message.Contains("UQ_Event_Username_Type", StringComparison.OrdinalIgnoreCase);
        }
    }
}
