using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using Microsoft.EntityFrameworkCore;

namespace lsa_web_apis.Services;

public class VideoRecordingService : IVideoRecordingService
{
    private VideosDbContext _context;

    public VideoRecordingService(VideosDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<IEnumerable<VideoRecording>> FilterVideosByQuery(string query, VideoType videoType)
    {
        if (string.IsNullOrWhiteSpace(query))
            throw new ArgumentException("Search query cannot be empty", nameof(query));

        return videoType switch
        {
            VideoType.Sermon => await _context.Sermons.Include(s => s.Preacher)
                            .Where(s =>
                                (!string.IsNullOrEmpty(s.Title) && EF.Functions.Like(s.Title, $"%{query}%")) ||
                                (s.Preacher != null && !string.IsNullOrEmpty(s.Preacher.Name) && EF.Functions.Like(s.Preacher.Name, $"%{query}%")))
                            .OrderByDescending(s => s.Id)
                            .ToListAsync(),
            VideoType.Lesson => await _context.Lessons.Include(l => l.Preacher)
                                .Where(l =>
                                    (!string.IsNullOrEmpty(l.Title) && EF.Functions.Like(l.Title, $"%{query}%")) ||
                                    (l.Preacher != null && !string.IsNullOrEmpty(l.Preacher.Name) && EF.Functions.Like(l.Preacher.Name, $"%{query}%")))
                                .OrderByDescending(l => l.Id)
                                .ToListAsync(),
            VideoType.Gallery => await _context.Lessons
                                .Where(l => !string.IsNullOrEmpty(l.Title) && EF.Functions.Like(l.Title, $"%{query}%"))
                                .OrderByDescending(l => l.Date)
                                .ToListAsync(),                                    
            _ => throw new ArgumentOutOfRangeException(nameof(videoType), videoType, "Invalid video type specified"),
        };
    }
}
