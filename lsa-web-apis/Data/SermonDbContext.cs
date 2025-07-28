using System;
using lsa_web_apis.Entities;
using Microsoft.EntityFrameworkCore;

namespace lsa_web_apis.Data;

public class VideosDbContext(DbContextOptions<VideosDbContext> options) : DbContext(options)
{
    public DbSet<Preacher> Preachers { get; set; }
    public DbSet<Sermon> Sermons { get; set; }
    public DbSet<Lesson> Lessons { get; set; }
    public DbSet<Gallery> Gallery { get; set; }
}
