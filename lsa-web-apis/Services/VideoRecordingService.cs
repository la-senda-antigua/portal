using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Extensions;
using lsa_web_apis.Models;
using Microsoft.EntityFrameworkCore;

namespace lsa_web_apis.Services;

public class VideoRecordingService : IVideoRecordingService
{
    private VideoRecordingsDbContext _context;

    public VideoRecordingService(VideoRecordingsDbContext context)
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
            VideoType.Gallery => await _context.GalleryVideos
                                .Where(l => !string.IsNullOrEmpty(l.Title) && EF.Functions.Like(l.Title, $"%{query}%"))
                                .OrderByDescending(l => l.Date)
                                .ToListAsync(),                                    
            _ => throw new ArgumentOutOfRangeException(nameof(videoType), videoType, "Invalid video type specified"),
        };
    }

    public async Task<PagedResult<T>> FilterVideosPaged<T>(string query, int page = 1, int pageSize = 10) where T : VideoRecording
    {
        if (string.IsNullOrWhiteSpace(query))
            throw new ArgumentException("Search query cannot be empty", nameof(query));

        var (dbSet, includePreacher) = GetQueryable<T>();

        var queryable = includePreacher ?
            ((IQueryable<T>)dbSet).Include("Preacher") :
            (IQueryable<T>)dbSet;

        var filtered = queryable
            .Where(v => !string.IsNullOrEmpty(v.Title) && EF.Functions.Like(v.Title, $"%{query}%"));

        return await filtered
            .OrderByDescending(v => v.Id)
            .ToPagedResultAsync(page, pageSize);
    }

    private (IQueryable dbSet, bool includePreacher) GetQueryable<T>() where T : VideoRecording
    {
        return typeof(T) switch
        {
            Type t when t == typeof(Sermon) => (_context.Sermons, true),
            Type t when t == typeof(Lesson) => (_context.Lessons, true),
            Type t when t == typeof(GalleryVideo) => (_context.GalleryVideos, false),
            _ => throw new ArgumentException($"Tipo no soportado: {typeof(T).Name}")
        };
    }

}
