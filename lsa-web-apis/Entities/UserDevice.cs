using System;

namespace lsa_web_apis.Entities;

public class UserDevice
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FirebaseToken { get; set; } = string.Empty;
    public string? Platform { get; set; }
    public DateTime LastLogin { get; set; } = DateTime.Now;
}
