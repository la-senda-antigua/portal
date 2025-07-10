using System.ComponentModel.DataAnnotations;

namespace lsa_web_apis.Entities;

public class VideoRecording
{
    [Required]
    public int Id { get; set; }
    public DateTime? Date { get; set; }
    public string? Title { get; set; }
    public string? VideoPath { get; set; }
    public int PreacherId { get; set; }
    public string? Cover { get; set; }

    public virtual Preacher? Preacher { get; set; }
}
