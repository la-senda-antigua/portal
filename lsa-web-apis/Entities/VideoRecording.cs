using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace lsa_web_apis.Entities;

public class VideoRecording
{
    [Required]
    [JsonPropertyName("id")]
    public int Id { get; set; }
    [JsonPropertyName("date")]
    public DateTime? Date { get; set; }
    [JsonPropertyName("title")]
    public string? Title { get; set; }
    [JsonPropertyName("videoPath")]
    public string? VideoPath { get; set; }
    [JsonPropertyName("cover")]
    public string? Cover { get; set; }
    [JsonPropertyName("playlist")]
    public Guid? Playlist { get; set; }

}
