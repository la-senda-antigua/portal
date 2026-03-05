namespace lsa_web_apis.Models;

public class RegisterDeviceRequest
{
    public string FcmToken { get; set; } = string.Empty;
    public string? Platform { get; set; }
}

public class UnregisterDeviceRequest
{
    public string FcmToken { get; set; } = string.Empty;
}
