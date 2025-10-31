namespace lsa_web_apis.Models
{
    public class CalendarDto
    {
        public string Name { get; set; } = string.Empty;
        public bool Active { get; set; } = true;
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
}
