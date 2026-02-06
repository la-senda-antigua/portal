using System.Text.Json.Serialization;

namespace lsa_web_apis.Entities
{
    public class Calendar
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool Active { get; set; }

        public ICollection<CalendarEvent> Events { get; set; } = new List<CalendarEvent>();
        public ICollection<CalendarManager> Managers { get; set; } = new List<CalendarManager>();
        public ICollection<CalendarMember> Members { get; set; } = new List<CalendarMember>();
    }

    public class CalendarEvent
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid CalendarId { get; set; }
        [JsonIgnore]
        public Calendar Calendar { get; set; } = null!;
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public bool AllDay { get; set; } = false;        
    }

    public class CalendarManager
    {
        public Guid CalendarId { get; set; }
        [JsonIgnore]
        public Calendar Calendar { get; set; } = null!;

        public Guid UserId { get; set; }
        [JsonIgnore]
        public User User { get; set; } = null!;
    }

    public class UserGroup
    {
        public Guid Id { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public bool Active { get; set; }

        public ICollection<UserGroupMember> Members { get; set; } = new List<UserGroupMember>();
    }

    public class UserGroupMember
    {
        public Guid UserGroupId { get; set; }
        [JsonIgnore]
        public UserGroup UserGroup { get; set; } = null!;

        public Guid UserId { get; set; }
        [JsonIgnore]
        public User User { get; set; } = null!;
    }

    public class CalendarMember
    {
        public Guid CalendarId { get; set; }
        [JsonIgnore]
        public Calendar Calendar { get; set; } = null!;

        public Guid UserId { get; set; }
        [JsonIgnore]
        public User User { get; set; } = null!;
    }
}
