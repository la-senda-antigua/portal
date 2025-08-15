
using lsa_web_apis.Entities;
using lsa_web_apis.Models;
using lsa_web_apis.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace lsa_web_apis.Controllers;

[Route("[controller]")]
[ApiController]
public class AuthController(IAuthService authService) : ControllerBase
{
    [Authorize(Roles = "Admin")]
    [HttpPost("register")]
    public async Task<ActionResult<User>> Register(string username, string role)
    {
        var user = await authService.RegisterAsync(username, role);
        if (user is null)
            return BadRequest("User name already in use.");

        return Ok(user);
    }

    [HttpPost("refresh-tokens")]
    public async Task<ActionResult<TokenResponseDto?>> RefreshTokens(RefreshTokenRequetDto request)
    {
        var response = await authService.RefreshTokensAsync(request);
        if (response is null)
            return Unauthorized("Invalid refresh token.");

        return Ok(response);
    }

    [HttpGet("google-login")]
    public IActionResult GoogleLogin(string callbackUrl)
    {
        var redirectUrl = Url.Action("GoogleResponse", "Auth", null, Request.Scheme);
        var properties = new AuthenticationProperties
        {
            RedirectUri = redirectUrl,
            Items = {
                { "prompt", "select_account" },
                { "callbackUrl", callbackUrl }
            }
        };
        return Challenge(properties, "Google");
    }

    [HttpGet("google-response")]
    public async Task<ActionResult<TokenResponseDto?>> GoogleResponse()
    {
        var googleAuthenticationResult = await HttpContext.AuthenticateAsync("Google");
        if (!googleAuthenticationResult.Succeeded)
            return BadRequest("Google authentication failed.");

        var claims = googleAuthenticationResult.Principal;
        var tokenResponse = await authService.LoginWithGoogleAsync(claims);
        if (tokenResponse is null)
            return BadRequest("Google login failed.");

        var callbackUrl = googleAuthenticationResult.Properties?.Items["callbackUrl"];
        if (string.IsNullOrEmpty(callbackUrl))
            return BadRequest("Missing callback URL.");
        
        string finalUrl = $"{callbackUrl}?access-token={tokenResponse.AccesToken}&refreshToken={tokenResponse.RefreshToken}";        
        return Redirect(finalUrl);
    }

    [Authorize]
    [HttpGet("validate-token")]
    public IActionResult ValidateToken() => Ok();
}

