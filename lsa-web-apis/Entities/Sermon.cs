using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace lsa_web_apis.Entities;

public class Sermon
{
    [Required]
    public int Id { get; set; }
    public DateTime? Date { get; set; }
    public string? Title { get; set; }
    public string? AudioPath { get; set; }
    public string? VideoPath { get; set; }
    public int Preacher_Id { get; set; }
    public string? Cover { get; set; }
}
