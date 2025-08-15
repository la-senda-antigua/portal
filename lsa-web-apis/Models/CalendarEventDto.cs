using System;
using System.Text.Json.Serialization;
using lsa_web_apis.Entities;

namespace lsa_web_apis.Models;

public class CalendarEventDto
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string? Description { get; set; }
    private bool IsCancelled;

    public CalendarEventStatus Status
    {
        get
        {
            if (IsCancelled) return CalendarEventStatus.Cancelled;

            DateTime _endTime = EndTime ?? StartTime.AddHours(3);
            DateTime now = DateTime.Now;

            if (_endTime < now) return CalendarEventStatus.Completed;
            if (StartTime <= now && _endTime >= now) return CalendarEventStatus.Active;
            return CalendarEventStatus.Future;
        }
    }
    public CalendarEventDto() { }
    public CalendarEventDto(CalendarEvent e)
    {
        Title = e.Title;
        Id = e.Id;
        StartTime = e.StartTime;
        EndTime = e.EndTime;
        Description = e.Description;
        IsCancelled = e.IsCancelled;
    }
}

public enum CalendarEventStatus
{
    Future = 0,
    Active = 1,
    Completed = 2,
    Cancelled = 3
}
