namespace lsa_web_apis.Models;

public class RefreshTokenRequestDto
{
    public string? AccessToken { get; set; }
    public required string RefreshToken { get; set; }
    public int ExpirationDays { get; set; } = 7;
}
