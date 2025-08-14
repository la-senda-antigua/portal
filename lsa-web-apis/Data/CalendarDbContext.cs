using System;
using lsa_web_apis.Entities;
using Microsoft.EntityFrameworkCore;

namespace lsa_web_apis.Data;

public class CalendarDbContext(DbContextOptions<CalendarDbContext> options) : DbContext(options)
{
    public DbSet<CalendarEvent> CalendarEvents { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CalendarEvent>()
            .Property<CalendarEventStatus>("_status")
            .HasColumnName("Status");
    }


}
