using Google.Apis.Auth;
using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

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

    public async Task<User?> RegisterWithPasswordAsync(string username, string password, string role, string name)
    {
        if (await context.PortalUsers.AnyAsync(u => u.Username == username))
        {
            return null;
        }

        CreatePasswordHash(password, out byte[] passwordHash, out byte[] passwordSalt);

        var user = new User()
        {
            Username = username,
            Name = name,
            Role = role,
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt
        };
        context.PortalUsers.Add(user);
        await context.SaveChangesAsync();

        return user;
    }

    public async Task<TokenResponseDto?> LoginAsync(string username, string password)
    {
        var user = await context.PortalUsers.FirstOrDefaultAsync(u => u.Username == username);
        if (user is null)
        {
            return null;
        }

        if (user.PasswordHash == null || user.PasswordSalt == null || !VerifyPasswordHash(password, user.PasswordHash, user.PasswordSalt))
        {
            return null;
        }

        return await CreateTokenResponse(user);
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

    public async Task<TokenResponseDto?> LoginWithAppleAsync(AppleLoginRequest request)
    {
        if (string.IsNullOrEmpty(request.IdentityToken)) return null;

        string email;
            var configurationManager = new ConfigurationManager<OpenIdConnectConfiguration>(
                "https://appleid.apple.com/.well-known/openid-configuration",
                new OpenIdConnectConfigurationRetriever());

            var openIdConfig = await configurationManager.GetConfigurationAsync(CancellationToken.None);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = "https://appleid.apple.com",
                ValidateAudience = true,
                ValidAudience = configuration["Authentication:Apple:ClientId"],
                ValidateLifetime = true,
                IssuerSigningKeys = openIdConfig.SigningKeys
            };

            var handler = new JwtSecurityTokenHandler();
            var result = await handler.ValidateTokenAsync(request.IdentityToken, validationParameters);

            if (!result.IsValid)
                throw new Exception($"Apple validation failed: {result.Exception?.Message ?? "Unknown error"}");

            var emailObj = result.Claims.FirstOrDefault(c => c.Key == "email" || c.Key == ClaimTypes.Email).Value;

            if (emailObj is not string emailFound)
                throw new Exception($"Apple token missing email claim. Available claims: {string.Join(", ", result.Claims.Keys)}");

            email = emailFound;
                        
        return await LoginWithGoogleAsync(email);
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

    private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
    {
        using var hmac = new HMACSHA512();
        passwordSalt = hmac.Key;
        passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
    }

    private bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
    {
        using var hmac = new HMACSHA512(passwordSalt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        return computedHash.SequenceEqual(passwordHash);
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

    public async Task<GoogleUserInfo?> VerifyGoogleAccessToken(string accessToken)
    {
        try
        {
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
            var response = await httpClient.GetAsync("https://www.googleapis.com/oauth2/v3/userinfo");

            var json = await response.Content.ReadAsStringAsync();
            var data = System.Text.Json.JsonSerializer.Deserialize<JsonElement>(json);

            if (data.TryGetProperty("email_verified", out var verified) && (verified.ValueKind == JsonValueKind.True || (verified.ValueKind == JsonValueKind.String && verified.GetString() == "true")))
            {
                return new GoogleUserInfo
                {
                    Email = data.GetProperty("email").GetString()!,
                    Name = data.TryGetProperty("name", out var name) ? name.GetString() : null,
                    Picture = data.TryGetProperty("picture", out var picture) ? picture.GetString() : null
                };
            }
            return null;
        }
        catch
        {
            return null;
        }
    }
}
