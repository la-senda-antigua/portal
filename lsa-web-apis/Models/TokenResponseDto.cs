namespace lsa_web_apis.Models;

public class TokenResponseDto
{
    public required string AccesToken { get; set; }
    public required string RefreshToken { get; set; }
}
