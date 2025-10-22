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
}
