using Google.Apis.Auth;
using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace lsa_web_apis.Services;

public class AuthService(UserDbContext context, IConfiguration configuration) : IAuthService
{
    public async Task<User?> RegisterAsync(string username, string role, string name)
    {
        if (await context.PortalUsers.AnyAsync(u => u.Username == username))
        {
            return null;
        }
        var user = new User()
        {
            Username = username,
            Name = name,
            Role = role,
        };
        context.PortalUsers.Add(user);
        await context.SaveChangesAsync();

        return user;
    }

    public async Task<TokenResponseDto?> RefreshTokensAsync(RefreshTokenRequetDto request)
    {
        var user = await ValidateRefreshTokenAsync(request.UserId, request.RefreshToken);
        if (user is null)
            return null;

        return await CreateTokenResponse(user);
    }

    public async Task<TokenResponseDto?> LoginWithGoogleAsync(ClaimsPrincipal? claimsPrincipal)
    {
        if (claimsPrincipal is null)
        {
            return null;
        }

        var email = claimsPrincipal.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(email))
        {
            return null;
        }

        var user = await context.PortalUsers.FirstOrDefaultAsync(u => u.Username.ToLower() == email.ToLower());
        if (user is null)
            throw new InvalidOperationException("User not found.");

        return await CreateTokenResponse(user);
    }

    public async Task<TokenResponseDto?> LoginWithGoogleAsync(string email)
    {
        if (string.IsNullOrEmpty(email))
        {
            return null;
        }

        var user = await context.PortalUsers
            .FirstOrDefaultAsync(u => u.Username.ToLower() == email.ToLower());

        if (user is null)
        {            
            throw new InvalidOperationException("User not found.");
        }

        return await CreateTokenResponse(user);
    }

    private async Task<TokenResponseDto> CreateTokenResponse(User user)
    {
        return new TokenResponseDto
        {
            AccesToken = CreateToken(user),
            RefreshToken = await GenerateAndSaveRefreshTokenAsync(user)
        };
    }

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private async Task<string> GenerateAndSaveRefreshTokenAsync(User user)
    {
        var refreshToken = GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpirationDate = DateTime.UtcNow.AddDays(7);
        context.PortalUsers.Update(user);
        await context.SaveChangesAsync();
        return refreshToken;
    }

    private async Task<User?> ValidateRefreshTokenAsync(Guid userId, string refreshToken)
    {
        var user = await context.PortalUsers.FindAsync(userId);
        if (user == null || user.RefreshToken != refreshToken || user.RefreshTokenExpirationDate < DateTime.UtcNow)
        {
            return null;
        }
        return user;
    }

    private string CreateToken(User user)
    {
        var claims = new List<Claim>()
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(configuration.GetValue<string>("AppSettings:Token")!)
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

        var tokenDescriptor = new JwtSecurityToken(
            issuer: configuration.GetValue<string>("AppSettings:Issuer")!,
            audience: configuration.GetValue<string>("AppSettings:Audience")!,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(5),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
    }

    public async Task<bool> RevokeRefreshTokenAsync(string refreshToken)
    {
        var user = await context.PortalUsers
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

        if (user == null)
            return false;

        user.RefreshToken = null;
        user.RefreshTokenExpirationDate = null;

        await context.SaveChangesAsync();
        return true;
    }

    public async Task<GoogleUserInfo?> VerifyGoogleToken(string idToken)
    {
        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken);
            return new GoogleUserInfo
            {
                Email = payload.Email,
                Name = payload.Name
            };
        }
        catch (Exception)
        {            
            return null;
        }
    }
}
