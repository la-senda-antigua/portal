using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace lsa_web_apis.Entities;

public class CalendarEvent
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string? Description { get; set; }

    [Column("Status")]
    private CalendarEventStatus _status;

    [NotMapped]
    public CalendarEventStatus Status
    {
        get
        {
            if (_status == CalendarEventStatus.Cancelled) return _status;

            DateTime _endTime = EndTime ?? StartTime.AddHours(3);
            DateTime now = DateTime.Now;

            if (_endTime < now) return CalendarEventStatus.Completed;
            if (StartTime <= now && _endTime >= now) return CalendarEventStatus.Active;
            return CalendarEventStatus.Future;
        }
    }

    public void CancelEvent() => _status = CalendarEventStatus.Cancelled;
    public void ReactivateEvent() => _status = CalendarEventStatus.Future;
}

public enum CalendarEventStatus
{
    Future = 0,
    Active = 1,
    Completed = 2,
    Cancelled = 3
}
