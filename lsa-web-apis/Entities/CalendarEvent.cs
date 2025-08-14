using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace lsa_web_apis.Entities;

public class CalendarEvent
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? Description { get; set; }
    [Column("Status")]
    private CalendarEventStatus _status;

    [NotMapped]
    public CalendarEventStatus Status
    {
        get
        {
            if (_status == CalendarEventStatus.Cancelled)
                return _status;
            else if (EndTime < DateTime.Now)
                return CalendarEventStatus.Completed;
            else if (StartTime <= DateTime.Now && EndTime >= DateTime.Now)
                return CalendarEventStatus.Active;
            else if (StartTime > DateTime.Now)
                return CalendarEventStatus.Future;
            else
                return CalendarEventStatus.Cancelled;
        }
    }

    public void CancelEvent()
    {
        _status = CalendarEventStatus.Cancelled;
    }
}

public enum CalendarEventStatus
{
    Future = 0,
    Active = 1,
    Completed = 2,
    Cancelled = 3
}
