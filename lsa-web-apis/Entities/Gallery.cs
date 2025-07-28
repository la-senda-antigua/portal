using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace lsa_web_apis.Entities;

public class Gallery
{
    public int Id { get; set; }
    public DateTime? Date { get; set; }
    public string? Title { get; set; }
    public string? VideoPath { get; set; }
    public string? Cover { get; set; }

}
