using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
using FirebaseAdmin.Messaging;
using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using lsa_web_apis.Services;

namespace lsa_web_apis.Controllers;

[Route("[controller]")]
[ApiController]
[Authorize]
public class NotificationsController(UserDbContext context, IFirebaseNotificationService firebaseNotificationService) : ControllerBase
{
    private readonly IFirebaseNotificationService _firebaseNotificationService = firebaseNotificationService;

    [HttpPost("register-device")]
    public async Task<IActionResult> RegisterDevice([FromBody] RegisterDeviceRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FcmToken))
        {
            return BadRequest("fcmToken is required.");
        }

        var usernameClaim = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrWhiteSpace(usernameClaim))
        {
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

        return Ok(new { message = "Device registered." });
    }

    [HttpPost("unregister-device")]
    public async Task<IActionResult> UnregisterDevice([FromBody] UnregisterDeviceRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FcmToken))
        {
            return BadRequest("fcmToken is required.");
        }

        var usernameClaim = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrWhiteSpace(usernameClaim))
        {
            return Unauthorized("Username claim not found.");
        }

        var normalizedUsername = usernameClaim.Trim().ToLowerInvariant();
        var normalizedToken = request.FcmToken.Trim();

        var existingDevice = await context.UserDevices
            .FirstOrDefaultAsync(x => x.FirebaseToken == normalizedToken && x.Username == normalizedUsername);

        if (existingDevice is null)
        {
            return Ok(new { message = "Device already unregistered." });
        }

        context.UserDevices.Remove(existingDevice);
        await context.SaveChangesAsync();

        return Ok(new { message = "Device unregistered." });
    }

    [HttpPost("send")]
    [Authorize(Roles = "Admin,CalendarManager")]
    public async Task<IActionResult> SendNotification([FromBody] SendNotificationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Body))
        {
            return BadRequest("title and body are required.");
        }

        var usernameClaim = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrWhiteSpace(usernameClaim))
        {
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
            return NotFound("No registered devices found for the target username.");
        }

        try
        {
            var result = await _firebaseNotificationService.SendMulticastAsync(
                tokens,
                request.Title.Trim(),
                request.Body.Trim()
            );
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
            return StatusCode(500, $"Failed to send push notification: {ex.Message}");
        }
    }
}
