using System;
using System.Text.Json.Serialization;
using lsa_web_apis.Entities;

namespace lsa_web_apis.Models;

public class PublicEventDto
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string StartTime { get; set; }
    public string? EndTime { get; set; }
    public string? Description { get; set; }
    private bool IsCancelled;

    public PublicEventStatus Status
    {
        get
        {
            if (IsCancelled) return PublicEventStatus.Cancelled;

            if (!DateTime.TryParse(StartTime, out DateTime startTime))
            {                
                return PublicEventStatus.Future;
            }

            DateTime _endTime;
            if (EndTime != null)
            {
                if (!DateTime.TryParse(EndTime, out _endTime))
                {                    
                    _endTime = startTime.AddHours(3);
                }
            }
            else
            {
                _endTime = startTime.AddHours(3);
            }

            DateTime now = DateTime.Now;

            if (_endTime < now) return PublicEventStatus.Completed;
            if (startTime <= now && _endTime >= now) return PublicEventStatus.Active;
            return PublicEventStatus.Future;
        }
    }

    public PublicEventDto() { }
    
    public PublicEventDto(PublicEvent e)
    {
        Title = e.Title;
        Id = e.Id;
        StartTime = e.StartTime;
        EndTime = e.EndTime ?? null;
        Description = e.Description;
        IsCancelled = e.IsCancelled;
    }
}

public enum PublicEventStatus
{
    Future = 0,
    Active = 1,
    Completed = 2,
    Cancelled = 3
}
