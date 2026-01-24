using System.Text.Json.Serialization;

namespace lsa_web_apis.Entities;

public class Sermon: VideoRecording
{
    [JsonPropertyName("audioPath")]
    public string AudioPath { get; set; } = "no asignado";

    [JsonPropertyName("preacherId")]
    public int PreacherId { get; set; }
        
    [JsonIgnore]
    public virtual Preacher? Preacher { get; set; }
}
