using System;

namespace lsa_web_apis.Entities;

public class CalendarEvent
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? Description { get; set; }
    private CalendarEventStatus _status;

    public CalendarEventStatus Status
    {
        get
        {
            if (EndTime < DateTime.Now)
                return CalendarEventStatus.Completed;
            else if (StartTime <= DateTime.Now && EndTime >= DateTime.Now)
                return CalendarEventStatus.Ongoing;
            else if (StartTime > DateTime.Now)
                return CalendarEventStatus.Upcoming;
            else
                return CalendarEventStatus.Cancelled;
        }
    }
}

public enum CalendarEventStatus
{
    Upcoming = 0,
    Ongoing = 1,
    Completed = 2,
    Cancelled = 3
}
