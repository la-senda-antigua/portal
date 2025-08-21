namespace lsa_web_apis.Models;

public class HydratedVideoPlaylist
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<int> VideoIds { get; set; } = new List<int>();
}