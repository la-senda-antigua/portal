namespace lsa_web_apis.Models;

public class UserDto
{
    public Guid? UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? LastName { get; set; }
    public string Role { get; set; } = string.Empty;
    public int RowId { get; set; }
    public string? Preferences { get; set; }
    public List<Guid> CalendarsAsManager { get; set; } = [];
    public List<Guid> CalendarsAsMember { get; set; } = [];
}
