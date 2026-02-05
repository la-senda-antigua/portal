using System.Text.Json.Serialization;

namespace lsa_web_apis.Entities;

public class Lesson : VideoRecording
{
    [JsonPropertyName("preacherId")]
    public int PreacherId { get; set; }    
    public virtual Preacher? Preacher { get; set; }
}
