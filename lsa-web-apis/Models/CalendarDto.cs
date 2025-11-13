namespace lsa_web_apis.Models
{
    public class CalendarDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool Active { get; set; } = true;
        public List<CalendarManagerDto>? Managers { get; set; }
    }

    public class CalendarEventDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime EventDate { get; set; }
        public Guid CalendarId { get; set; }

        public DateOnly? Date { get; set; }
        public TimeOnly? StartTime { get; set; }
        public TimeOnly? EndTime { get; set; }
        public DateTime? AlertDate { get; set; }
    }
    
    public class CalendarManagerDto
    {
        public Guid CalendarId { get; set; }
        public string Username { get; set; } = string.Empty;
        public Guid UserId { get; set; }
    }

    public class CalendarMemberDto
    {
        public Guid CalendarId { get; set; }
        public CalendarDto Calendar { get; set; } = null!;
    }
}
