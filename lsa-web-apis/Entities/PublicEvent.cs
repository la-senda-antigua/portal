using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace lsa_web_apis.Entities;

public class PublicEvent
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string StartTime { get; set; } ="";
    public string? EndTime { get; set; }
    public string? Description { get; set; }
    public bool IsCancelled { get; set; } = false;    
}

