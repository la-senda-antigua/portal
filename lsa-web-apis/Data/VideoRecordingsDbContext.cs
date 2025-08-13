using System;
using lsa_web_apis.Entities;
using Microsoft.EntityFrameworkCore;

namespace lsa_web_apis.Data;

public class VideoRecordingsDbContext(DbContextOptions<VideoRecordingsDbContext> options) : DbContext(options)
{
    public DbSet<Preacher> Preachers { get; set; }
    public DbSet<Sermon> Sermons { get; set; }
    public DbSet<Lesson> Lessons { get; set; }
    // Videos that are not sermons or lessons
    public DbSet<GalleryVideo> GalleryVideos { get; set; }
    // Groups of related videos
    public DbSet<VideoPlaylist> Playlists { get; set; }

    //Calendar events
    public DbSet<CalendarEvent> CalendarEvents { get; set; }
}