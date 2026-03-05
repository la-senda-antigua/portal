namespace lsa_web_apis.Models;

public class SendNotificationRequest
{
    public string? Username { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}
