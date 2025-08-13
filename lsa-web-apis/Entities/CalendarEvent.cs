using System;

namespace lsa_web_apis.Entities;

public class CalendarEvent
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public DateTime StartingAt { get; set; }
    public DateTime EndingAt { get; set; }
    public string? Description { get; set; }
    public CalendarEventStatus Status { get; set; } = CalendarEventStatus.Upcoming;
}

public enum CalendarEventStatus
{
    Upcoming = 0,
    Ongoing = 1,
    Completed = 2,
    Cancelled = 3
}
