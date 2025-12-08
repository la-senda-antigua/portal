namespace lsa_web_apis.Models
{
    public class GoogleMobileLoginRequest
    {
        public required string IdToken { get; set; }
    }
    public class GoogleUserInfo
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

}
