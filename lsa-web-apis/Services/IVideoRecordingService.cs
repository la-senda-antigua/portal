using lsa_web_apis.Entities;

namespace lsa_web_apis.Services;

public enum VideoType
{
    Sermon,
    Lesson
}
public interface IVideoRecordingService
{
    Task<IEnumerable<VideoRecording>> FilterVideosByQuery(string query, VideoType videoType);
}
