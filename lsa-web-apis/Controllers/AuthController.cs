
using System.Security.Claims;
using lsa_web_apis.Entities;
using lsa_web_apis.Extensions;
using lsa_web_apis.Models;
using lsa_web_apis.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace lsa_web_apis.Controllers;

[Route("[controller]")]
[ApiController]
public class AuthController(IAuthService authService, ILogger<AuthController> logger) : ControllerBase
{
    [Authorize(Roles = "Admin")]
    [HttpPost("register")]
    public async Task<ActionResult<User>> Register(string username, string role, string name, string lastName)
    {
        var log = RequestLoggingHelper.CreateContext<AuthController>(logger, User, nameof(Register));

        try
        {
            log.Info("Register requested. Username: {Username}, Role: {Role}", username, role);
            log.InfoJson("Register payload:", new { username, role, name, lastName });

            var user = await authService.RegisterAsync(username, role, name, lastName);
            if (user is null)
            {
                log.Warning("Username already in use. Username: {Username}", username);
                return BadRequest("User name already in use.");
            }

            log.Info("User registered successfully. Username: {Username}", username);
            return Ok(user);
        }
        catch (Exception ex)
        {
            log.Error(ex, "Error registering user. Username: {Username}", username);
            return StatusCode(500, "An error occurred while registering the user.");
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("register-with-password")]
    public async Task<ActionResult<User>> RegisterWithPassword([FromBody] RegisterWithPasswordDto request)
    {
        var log = RequestLoggingHelper.CreateContext<AuthController>(logger, User, nameof(RegisterWithPassword));

        try
        {
            log.Info("RegisterWithPassword requested. Username: {Username}, Role: {Role}", request.Username, request.Role);
            log.InfoJson("RegisterWithPassword payload:", new { request.Username, request.Role, request.Name });

            var user = await authService.RegisterWithPasswordAsync(request.Username, request.Password, request.Role, request.Name ?? "");
            if (user is null)
            {
                log.Warning("Username already in use. Username: {Username}", request.Username);
                return BadRequest("User name already in use.");
            }

            log.Info("User registered successfully. Username: {Username}", request.Username);
            return Ok(user);
        }
        catch (Exception ex)
        {
            log.Error(ex, "Error registering user with password. Username: {Username}", request.Username);
            return StatusCode(500, "An error occurred while registering the user.");
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<TokenResponseDto>> Login([FromBody] LoginDto request)
    {
        var log = RequestLoggingHelper.CreateContext<AuthController>(logger, User, nameof(Login));

        try
        {
            log.Info("Login requested. Username: {Username}", request.Username);
            log.InfoJson("Login payload:", new { request.Username, HasPassword = !string.IsNullOrWhiteSpace(request.Password) });

            var response = await authService.LoginAsync(request.Username, request.Password);
            if (response is null)
            {
                log.Warning("Login failed for username: {Username}", request.Username);
                return BadRequest("Username or password incorrect.");
            }

            log.Info("Login successful for username: {Username}", request.Username);
            return Ok(response);
        }
        catch (Exception ex)
        {
            log.Error(ex, "Error during login. Username: {Username}", request.Username);
            return StatusCode(500, "An error occurred while logging in.");
        }
    }

    [HttpPost("refresh-tokens")]
    public async Task<ActionResult<TokenResponseDto?>> RefreshTokens([FromBody] RefreshTokenRequestDto request)
    {
        var log = RequestLoggingHelper.CreateContext<AuthController>(logger, User, nameof(RefreshTokens));

        try
        {
            log.Info("RefreshTokens requested.");
            log.InfoJson("RefreshTokens payload:", new
            {
                HasRefreshToken = !string.IsNullOrWhiteSpace(request.RefreshToken),
                RefreshTokenLength = request.RefreshToken?.Length ?? 0,
                HasAccessToken = !string.IsNullOrWhiteSpace(request.AccessToken)
            });

            var response = await authService.RefreshTokensAsync(request);
            if (response is null)
            {
                log.Warning("Invalid refresh token.");
                return Unauthorized("Invalid refresh token.");
            }

            log.Info("RefreshTokens successful.");
            return Ok(response);
        }
        catch (Exception ex)
        {
            log.Error(ex, "Error refreshing tokens.");
            return StatusCode(500, "An error occurred while refreshing tokens.");
        }
    }

    [HttpGet("google-login")]
    public IActionResult GoogleLogin(string callbackUrl)
    {
        var log = RequestLoggingHelper.CreateContext<AuthController>(logger, User, nameof(GoogleLogin));

        try
        {
            log.Info("Google login requested. CallbackUrl: {CallbackUrl}", callbackUrl);

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
        catch (Exception ex)
        {
            log.Error(ex, "Error preparing Google login.");
            return StatusCode(500, "An error occurred while preparing Google login.");
        }
    }

    [HttpGet("google-response")]
    public async Task<ActionResult<TokenResponseDto?>> GoogleResponse()
    {
        var log = RequestLoggingHelper.CreateContext<AuthController>(logger, User, nameof(GoogleResponse));

        try
        {
            log.Info("Google response processing started.");

            var googleAuthenticationResult = await HttpContext.AuthenticateAsync("Google");
            if (!googleAuthenticationResult.Succeeded)
            {
                log.Warning("Google authentication failed.");
                return BadRequest("Google authentication failed.");
            }

            var claims = googleAuthenticationResult.Principal;
            var tokenResponse = await authService.LoginWithGoogleAsync(claims);
            if (tokenResponse is null)
            {
                log.Warning("Google login failed after authentication.");
                return BadRequest("Google login failed.");
            }

            var callbackUrl = googleAuthenticationResult.Properties?.Items["callbackUrl"];
            if (string.IsNullOrEmpty(callbackUrl))
            {
                log.Warning("Missing callback URL.");
                return BadRequest("Missing callback URL.");
            }

            string finalUrl = $"{callbackUrl}?access-token={tokenResponse.AccesToken}&refreshToken={tokenResponse.RefreshToken}";
            log.Info("Google response processed successfully.");
            return Redirect(finalUrl);
        }
        catch (Exception ex)
        {
            log.Error(ex, "Error processing Google response.");
            return StatusCode(500, "An error occurred while processing Google response.");
        }
    }

    [HttpPost("google-mobile")]
    public async Task<IActionResult> GoogleMobileLogin([FromBody] GoogleMobileLoginRequest request)
    {
        var log = RequestLoggingHelper.CreateContext<AuthController>(logger, User, nameof(GoogleMobileLogin));
        GoogleUserInfo? googleUser = null;

        try
        {
            log.Info("Google mobile login requested.");
            log.InfoJson("GoogleMobileLogin payload:", new
            {
                HasIdToken = !string.IsNullOrWhiteSpace(request.IdToken),
                IdTokenLength = request.IdToken?.Length ?? 0,
                HasAccessToken = !string.IsNullOrWhiteSpace(request.AccessToken),
                AccessTokenLength = request.AccessToken?.Length ?? 0
            });

            if (!string.IsNullOrEmpty(request.IdToken))
            {
                googleUser = await authService.VerifyGoogleToken(request.IdToken);
            }
            else if (!string.IsNullOrEmpty(request.AccessToken))
            {
                googleUser = await authService.VerifyGoogleAccessToken(request.AccessToken);
            }

            // Google login failed
            if (googleUser == null || string.IsNullOrEmpty(googleUser.Email))
            {
                log.Warning("Invalid Google token in mobile login.");
                return Unauthorized("Invalid Google token.");
            }
            
            var tokenResponse = await authService.LoginWithGoogleAsync(googleUser.Email);

            log.Info("Google mobile login successful. Email: {Email}", googleUser.Email);

            return Ok(new
            {
                Token = tokenResponse,
                User = new
                {
                    googleUser.Name,
                    googleUser.Email,
                    Avatar = googleUser.Picture
                }
            });
        }
        catch (InvalidOperationException ex) when (ex.Message == "User not found.")
        {
            log.Warning("Google mobile login user not found.");
            return Forbid();
        }
        catch (Exception ex)
        {
            log.Error(ex, "Error during Google mobile login.");
            return StatusCode(500, "An error occurred while processing Google mobile login.");
        }
    }

    [HttpPost("apple-login")]
    public async Task<IActionResult> AppleLogin([FromBody] AppleLoginRequest request)
    {
        var log = RequestLoggingHelper.CreateContext<AuthController>(logger, User, nameof(AppleLogin));

        try
        {
            log.Info("Apple login requested.");
            log.InfoJson("AppleLogin payload:", new
            {
                HasIdentityToken = !string.IsNullOrWhiteSpace(request.IdentityToken),
                IdentityTokenLength = request.IdentityToken?.Length ?? 0,
                request.FirstName,
                request.LastName
            });

            var response = await authService.LoginWithAppleAsync(request);
            if (response == null)
            {
                log.Warning("Invalid Apple credentials.");
                return Unauthorized("Invalid Apple credentials.");
            }

            log.Info("Apple login successful.");
            return Ok(response);
        }
        catch (InvalidOperationException ex) when (ex.Message == "User not found.")
        {
            log.Warning("Apple login user not found.");
            return Forbid();
        }
        catch (Exception ex)
        {
            log.Error(ex, "Error during Apple login.");
            return StatusCode(500, "An error occurred while processing Apple login.");
        }
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDto request)
    {
        var log = RequestLoggingHelper.CreateContext<AuthController>(logger, User, nameof(Logout));

        try
        {
            log.Info("Logout requested.");
            log.InfoJson("Logout payload:", new
            {
                HasRefreshToken = !string.IsNullOrWhiteSpace(request.RefreshToken),
                RefreshTokenLength = request.RefreshToken?.Length ?? 0,
                HasAccessToken = !string.IsNullOrWhiteSpace(request.AccessToken)
            });

            if (string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                log.Warning("Invalid refresh token on logout.");
                return BadRequest("Invalid refresh token.");
            }

            var result = await authService.RevokeRefreshTokenAsync(request.RefreshToken);
            if (!result)
            {
                log.Warning("Invalid refresh token on logout.");
                return BadRequest("Invalid refresh token.");
            }

            log.Info("Logout successful.");
            return Ok();
        }
        catch (Exception ex)
        {
            log.Error(ex, "Error during logout.");
            return StatusCode(500, "An error occurred while logging out.");
        }
    }


    [Authorize]
    [HttpGet("validate-token")]
    public IActionResult ValidateToken()
    {        
        try
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
        catch (Exception)
        {            
            return StatusCode(500, "An error occurred while validating token.");
        }

    }

    [HttpGet]
    [Route("test")]
    public IActionResult Test()
    {
        var log = RequestLoggingHelper.CreateContext<AuthController>(logger, User, nameof(Test));

        try
        {
            log.Info("Test endpoint called.");
            return Ok("Working");
        }
        catch (Exception ex)
        {
            log.Error(ex, "Error in test endpoint.");
            return StatusCode(500, "An error occurred in test endpoint.");
        }
    }
}
