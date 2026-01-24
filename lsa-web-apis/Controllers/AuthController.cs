
using System.Security.Claims;
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
    public async Task<ActionResult<User>> Register(string username, string role, string name, string lastName)
    {
        var user = await authService.RegisterAsync(username, role, name , lastName);
        if (user is null)
            return BadRequest("User name already in use.");

        return Ok(user);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("register-with-password")]
    public async Task<ActionResult<User>> RegisterWithPassword([FromBody] RegisterWithPasswordDto request)
    {
        var user = await authService.RegisterWithPasswordAsync(request.Username, request.Password, request.Role, request.Name ?? "");
        if (user is null)
            return BadRequest("User name already in use.");

        return Ok(user);
    }

    [HttpPost("login")]
    public async Task<ActionResult<TokenResponseDto>> Login([FromBody] LoginDto request)
    {
        var response = await authService.LoginAsync(request.Username, request.Password);
        if (response is null)
            return BadRequest("Username or password incorrect.");

        return Ok(response);
    }

    [HttpPost("refresh-tokens")]
    public async Task<ActionResult<TokenResponseDto?>> RefreshTokens(RefreshTokenRequestDto request)
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

    [HttpPost("google-mobile")]
    public async Task<IActionResult> GoogleMobileLogin([FromBody] GoogleMobileLoginRequest request)
    {
        try
        {
            GoogleUserInfo? googleUser = null;

            if (!string.IsNullOrEmpty(request.IdToken))
            {
                googleUser = await authService.VerifyGoogleToken(request.IdToken);
            }
            else if (!string.IsNullOrEmpty(request.AccessToken))
            {
                googleUser = await authService.VerifyGoogleAccessToken(request.AccessToken);
            }

            if (googleUser == null || string.IsNullOrEmpty(googleUser.Email))
                return Unauthorized("Invalid token");

            var tokenResponse = await authService.LoginWithGoogleAsync(googleUser.Email);
            return Ok(new
            {
                Token = tokenResponse,
                User = new { googleUser.Name, googleUser.Email, Avatar = googleUser.Picture }
            });
        }
        catch (InvalidOperationException ex) when (ex.Message == "User not found.")
        {
            return Unauthorized("User not registered.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error: {ex.Message}");
        }
    }

    [HttpPost("apple-login")]
    public async Task<ActionResult<TokenResponseDto>> AppleLogin([FromBody] AppleLoginRequest request)
    {
        try
        {
            var response = await authService.LoginWithAppleAsync(request);
            if (response is null)
            {
                return BadRequest("Apple authentication failed.");
            }

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message == "User not found.")
            {
                return Unauthorized("User not registered.");
            }

            return StatusCode(500, $"Error: {ex.Message}");
        }
    }


    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDto request)
    {
        var result = await authService.RevokeRefreshTokenAsync(request.RefreshToken);
        if (!result)
            return BadRequest("Invalid refresh token.");

        return Ok();
    }


    [Authorize]
    [HttpGet("validate-token")]
    public IActionResult ValidateToken()
    {
        var roles = User.Claims
        .Where(c => c.Type == ClaimTypes.Role || c.Type == "role")
        .Select(c => c.Value)
        .Distinct()
        .ToList();

        var user = new
        {
            id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            email = User.FindFirst(ClaimTypes.Email)?.Value ?? User.Identity?.Name,
            roles
        };

        return Ok(new { valid = true, user });

    }

    [HttpGet]
    [Route("test")]
    public IActionResult Test()
    {
        return Ok("Working");
    }
}
