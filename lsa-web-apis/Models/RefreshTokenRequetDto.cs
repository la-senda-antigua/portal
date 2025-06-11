namespace lsa_web_apis.Models;

public class RefreshTokenRequetDto
{
    public Guid UserId { get; set; }
    public required string RefreshToken { get; set; }
}
