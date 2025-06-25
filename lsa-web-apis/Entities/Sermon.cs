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
    public string AudioPath { get; set; } = "no asignado";
    public string? VideoPath { get; set; }
    public int PreacherId { get; set; }
    public string? Cover { get; set; }

    public virtual Preacher? Preacher { get; set; }
}
