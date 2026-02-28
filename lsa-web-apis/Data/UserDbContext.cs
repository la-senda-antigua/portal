using System;
using lsa_web_apis.Entities;
using Microsoft.EntityFrameworkCore;

namespace lsa_web_apis.Data;

public class UserDbContext(DbContextOptions<UserDbContext> options) : DbContext(options)
{
    public DbSet<User> PortalUsers { get; set; }
    public DbSet<Calendar> Calendars { get; set; } = null!;
    public DbSet<CalendarEvent> CalendarEvents { get; set; } = null!;
    public DbSet<CalendarManager> CalendarManagers { get; set; } = null!;
    public DbSet<CalendarMember> CalendarMembers { get; set; } = null!;
    public DbSet<UserGroup> UserGroups { get; set; } = null!;
    public DbSet<UserGroupMember> UserGroupMembers { get; set; } = null!;
    public DbSet<CalendarEventAssignee> CalendarEventAssignees { get; set; } = null!;
    public DbSet<UserDevice> UserDevices { get; set; } = null!;
    public DbSet<NotificationLog> NotificationLogs { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<CalendarManager>()
            .HasKey(cm => new { cm.CalendarId, cm.UserId });

        modelBuilder.Entity<CalendarMember>()
            .HasKey(cm => new { cm.CalendarId, cm.UserId });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);    
            entity.Property(e => e.RowId).IsRequired();
        });

        modelBuilder.Entity<UserGroupMember>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.UserGroupId });
        });

        modelBuilder.Entity<CalendarEventAssignee>().HasKey(e => new { e.CalendarEventId, e.UserId });

        modelBuilder.Entity<UserDevice>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(320);
            entity.Property(e => e.FirebaseToken).IsRequired().HasMaxLength(512);
            entity.Property(e => e.Platform).HasMaxLength(50);
            entity.HasIndex(e => e.FirebaseToken).IsUnique();
            entity.HasIndex(e => e.Username);
        });

        modelBuilder.Entity<NotificationLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.EventId).IsRequired();
            entity.Property(e => e.Username).IsRequired().HasMaxLength(320);
            entity.Property(e => e.NotificationType).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => new { e.EventId, e.Username, e.NotificationType }).IsUnique();
            entity.HasIndex(e => e.Username);
        });
    }

}
