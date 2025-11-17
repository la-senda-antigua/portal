namespace lsa_web_apis.Models;

public class UserDto
{
    public Guid? UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string Role { get; set; } = string.Empty;
    public List<CalendarDto> CalendarsAsManager { get; set; } = new List<CalendarDto>();
    public List<CalendarDto> CalendarsAsMember { get; set; } = new List<CalendarDto>();
}
