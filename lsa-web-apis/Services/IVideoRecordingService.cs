using lsa_web_apis.Entities;
using lsa_web_apis.Models;

namespace lsa_web_apis.Services;

public enum VideoType
{
    Sermon,
    Lesson,
    Gallery
}
public interface IVideoRecordingService
{
    Task<IEnumerable<VideoRecording>> FilterVideosByQuery(string query, VideoType videoType);
    Task<PagedResult<T>> FilterVideosPaged<T>(string query, int page, int pageSize) where T : VideoRecording;
}
