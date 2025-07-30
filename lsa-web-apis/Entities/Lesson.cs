namespace lsa_web_apis.Entities;

public class Lesson : VideoRecording
{
    public int PreacherId { get; set; }
    public virtual Preacher? Preacher { get; set; }
}
