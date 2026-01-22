using System.Security.Claims;
using lsa_web_apis.Entities;
using lsa_web_apis.Models;

namespace lsa_web_apis.Services;

public interface IAuthService
{
    Task<User?> RegisterAsync(string username, string role, string name);
    Task<User?> RegisterWithPasswordAsync(string username, string password, string role, string name);
    Task<TokenResponseDto?> LoginAsync(string username, string password);
    Task<TokenResponseDto?> RefreshTokensAsync(RefreshTokenRequestDto request);
    Task<TokenResponseDto?> LoginWithGoogleAsync(ClaimsPrincipal? claimsPrincipal);
    Task<TokenResponseDto?> LoginWithGoogleAsync(string email);
    public Task<bool> RevokeRefreshTokenAsync(string refreshToken);
    public Task<GoogleUserInfo?> VerifyGoogleToken(string idToken);
    public Task<GoogleUserInfo?> VerifyGoogleAccessToken(string accessToken);
    Task<TokenResponseDto?> LoginWithAppleAsync(AppleLoginRequest request);
}
