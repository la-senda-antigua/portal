using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
using FirebaseAdmin.Messaging;
using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Extensions;
using lsa_web_apis.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using lsa_web_apis.Services;

namespace lsa_web_apis.Controllers;

[Route("[controller]")]
[ApiController]
[Authorize]
public class NotificationsController(UserDbContext context, IFirebaseNotificationService firebaseNotificationService, ILogger<NotificationsController> logger) : ControllerBase
{
    private readonly IFirebaseNotificationService _firebaseNotificationService = firebaseNotificationService;

    [HttpPost("register-device")]
    public async Task<IActionResult> RegisterDevice([FromBody] RegisterDeviceRequest request)
    {
        var log = RequestLoggingHelper.CreateContext<NotificationsController>(logger, User, nameof(RegisterDevice));

        try
        {
            log.Info("Register device requested.");
            log.InfoJson("RegisterDevice payload:", new
            {
                HasFcmToken = !string.IsNullOrWhiteSpace(request.FcmToken),
                FcmTokenLength = request.FcmToken?.Length ?? 0,
                request.Platform
            });

            if (string.IsNullOrWhiteSpace(request.FcmToken))
            {
                log.Warning("Missing FCM token.");
                return BadRequest("fcmToken is required.");
            }

            var usernameClaim = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrWhiteSpace(usernameClaim))
            {
                log.Warning("Username claim not found.");
                return Unauthorized("Username claim not found.");
            }

            var normalizedUsername = usernameClaim.Trim().ToLowerInvariant();
            var normalizedToken = request.FcmToken.Trim();
            var normalizedPlatform = string.IsNullOrWhiteSpace(request.Platform)
                ? null
                : request.Platform.Trim();

            var existingDevice = await context.UserDevices
                .FirstOrDefaultAsync(x => x.FirebaseToken == normalizedToken);

            if (existingDevice is null)
            {
                context.UserDevices.Add(new UserDevice
                {
                    Username = normalizedUsername,
                    FirebaseToken = normalizedToken,
                    Platform = normalizedPlatform,
                    LastLogin = DateTime.Now
                });
            }
            else
            {
                existingDevice.Username = normalizedUsername;
                existingDevice.Platform = normalizedPlatform;
                existingDevice.LastLogin = DateTime.Now;
            }

            await context.SaveChangesAsync();

            log.Info("Device registered successfully. Username: {Username}", normalizedUsername);
            return Ok(new { message = "Device registered." });
        }
        catch (Exception ex)
        {
            log.Error(ex, "Error registering device.");
            return StatusCode(500, "An error occurred while registering device.");
        }
    }

    [HttpPost("unregister-device")]
    public async Task<IActionResult> UnregisterDevice([FromBody] UnregisterDeviceRequest request)
    {
        var log = RequestLoggingHelper.CreateContext<NotificationsController>(logger, User, nameof(UnregisterDevice));

        try
        {
            log.Info("Unregister device requested.");
            log.InfoJson("UnregisterDevice payload:", new
            {
                HasFcmToken = !string.IsNullOrWhiteSpace(request.FcmToken),
                FcmTokenLength = request.FcmToken?.Length ?? 0
            });

            if (string.IsNullOrWhiteSpace(request.FcmToken))
            {
                log.Warning("Missing FCM token.");
                return BadRequest("fcmToken is required.");
            }

            var usernameClaim = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrWhiteSpace(usernameClaim))
            {
                log.Warning("Username claim not found.");
                return Unauthorized("Username claim not found.");
            }

            var normalizedUsername = usernameClaim.Trim().ToLowerInvariant();
            var normalizedToken = request.FcmToken.Trim();

            var existingDevice = await context.UserDevices
                .FirstOrDefaultAsync(x => x.FirebaseToken == normalizedToken && x.Username == normalizedUsername);

            if (existingDevice is null)
            {
                log.Info("Device already unregistered. Username: {Username}", normalizedUsername);
                return Ok(new { message = "Device already unregistered." });
            }

            context.UserDevices.Remove(existingDevice);
            await context.SaveChangesAsync();

            log.Info("Device unregistered successfully. Username: {Username}", normalizedUsername);
            return Ok(new { message = "Device unregistered." });
        }
        catch (Exception ex)
        {
            log.Error(ex, "Error unregistering device.");
            return StatusCode(500, "An error occurred while unregistering device.");
        }
    }

    [HttpPost("send")]
    [Authorize(Roles = "Admin,CalendarManager")]
    public async Task<IActionResult> SendNotification([FromBody] SendNotificationRequest request)
    {
        var log = RequestLoggingHelper.CreateContext<NotificationsController>(logger, User, nameof(SendNotification));

        try
        {
            log.Info("Send notification requested.");
            log.InfoJson("SendNotification payload:", new
            {
                request.Username,
                request.Title,
                request.Body,
                BodyLength = request.Body?.Length ?? 0
            });

            if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Body))
            {
                log.Warning("Title/body required.");
                return BadRequest("title and body are required.");
            }

            var usernameClaim = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrWhiteSpace(usernameClaim))
            {
                log.Warning("Username claim not found.");
                return Unauthorized("Username claim not found.");
            }

            var requesterUsername = usernameClaim.Trim().ToLowerInvariant();
            var targetUsername = string.IsNullOrWhiteSpace(request.Username)
                ? requesterUsername
                : request.Username.Trim().ToLowerInvariant();

            var isAdmin = User.Claims.Any(c =>
                (c.Type == ClaimTypes.Role || c.Type == "role") &&
                c.Value.Equals("Admin", StringComparison.OrdinalIgnoreCase));

            if (!isAdmin && targetUsername != requesterUsername)
            {
                log.Warning("Forbidden notification target. Requester: {Requester}, Target: {Target}", requesterUsername, targetUsername);
                return Forbid();
            }

            var tokens = await context.UserDevices
                .Where(x => x.Username == targetUsername)
                .Select(x => x.FirebaseToken)
                .Where(x => x != null && x != "")
                .Distinct()
                .ToListAsync();

            if (tokens.Count == 0)
            {
                log.Warning("No tokens found for target username: {Target}", targetUsername);
                return NotFound("No registered devices found for the target username.");
            }

            var result = await _firebaseNotificationService.SendMulticastAsync(
                tokens,
                request.Title.Trim(),
                request.Body.Trim()
            );

            log.Info("Notification sent. Requester: {Requester}. Target: {Target}. Success: {SuccessCount}. Failure: {FailureCount}", requesterUsername, targetUsername, result.SuccessCount, result.FailureCount);

            return Ok(new
            {
                targetUsername,
                requestedBy = requesterUsername,
                totalTokens = tokens.Count,
                successCount = result.SuccessCount,
                failureCount = result.FailureCount
            });
        }
        catch (Exception ex)
        {
            log.Error(ex, "Error sending notification.");
            return StatusCode(500, "Failed to send push notification.");
        }
    }
}
