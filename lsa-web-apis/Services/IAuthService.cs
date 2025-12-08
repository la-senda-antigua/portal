using System.Security.Claims;
using lsa_web_apis.Entities;
using lsa_web_apis.Models;

namespace lsa_web_apis.Services;

public interface IAuthService
{
    Task<User?> RegisterAsync(string username, string role, string name);
    Task<TokenResponseDto?> RefreshTokensAsync(RefreshTokenRequetDto request);
    Task<TokenResponseDto?> LoginWithGoogleAsync(ClaimsPrincipal? claimsPrincipal);
    Task<TokenResponseDto?> LoginWithGoogleAsync(string email);
    public Task<bool> RevokeRefreshTokenAsync(string refreshToken);
    public Task<GoogleUserInfo?> VerifyGoogleToken(string idToken);
}
