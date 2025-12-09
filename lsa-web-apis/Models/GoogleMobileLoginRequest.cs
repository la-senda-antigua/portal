namespace lsa_web_apis.Models
{
    public class GoogleMobileLoginRequest
    {
        public string? IdToken { get; set; }
        public string? AccessToken { get; set; }
    }
    public class GoogleUserInfo
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

}
