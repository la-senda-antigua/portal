using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using lsa_web_apis.Entities;
using lsa_web_apis.Models;
using lsa_web_apis.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace lsa_web_apis.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController(IAuthService authService) : ControllerBase
{

    [HttpPost("register")]
    public async Task<ActionResult<User>> Register(UserDto request)
    {
        var user = await authService.RegisterAsync(request);
        if (user is null)
            return BadRequest("User name already in use.");

        return Ok(user);
    }

    [HttpPost("login")]
    public async Task<ActionResult<TokenResponseDto?>> Login(UserDto request)
    {
        var response = await authService.LoginAsync(request);
        if (response is null)
            return BadRequest("Invalid user.");

        return Ok(response);
    }

    [HttpPost("refresh-tokens")]
    public async Task<ActionResult<TokenResponseDto?>> RefreshTokens(RefreshTokenRequetDto request)
    {
        var response = await authService.RefreshTokensAsync(request);
        if (response is null)
            return Unauthorized("Invalid refresh token.");

        return Ok(response);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public IActionResult AuthenticatedEndpoint()
    {
        return Ok("You are authenticated");
    }
}

