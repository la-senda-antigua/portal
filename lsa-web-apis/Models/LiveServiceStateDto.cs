namespace lsa_web_apis.Models;

public class LiveServiceStateDto
{
    public bool IsOn { get; set; }
    public string? VideoURL { get; set; }
    public DateTime? EndTime { get; set; }
}
