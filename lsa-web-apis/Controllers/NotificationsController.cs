using System.Security.Claims;
using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace lsa_web_apis.Controllers;

[Route("api/notifications")]
[ApiController]
[Authorize]
public class NotificationsController(UserDbContext context) : ControllerBase
{
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
}
