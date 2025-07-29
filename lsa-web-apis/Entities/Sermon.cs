namespace lsa_web_apis.Entities;

public class Sermon: VideoRecording
{
    public string AudioPath { get; set; } = "no asignado";
    public int PreacherId { get; set; }
    public virtual Preacher? Preacher { get; set; }
}
