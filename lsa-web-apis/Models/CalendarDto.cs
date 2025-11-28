using lsa_web_apis.Entities;

namespace lsa_web_apis.Models
{
    public class CalendarDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool Active { get; set; } = true;
        public List<CalendarManagerDto>? Managers { get; set; }
        public List<CalendarMemberDto>? Members { get; set; }
    }

    public class CalendarEventDto
    {
        public Guid? Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime EventDate { get; set; }
        public Guid CalendarId { get; set; }

        public TimeOnly? Start { get; set; }
        public TimeOnly? End { get; set; }
        public DateTime? AlertDate { get; set; }
    }

    public class CalendarManagerDto
    {
        public Guid CalendarId { get; set; }
        public string Username { get; set; } = string.Empty;
        public Guid UserId { get; set; }
    }

    public class CalendarMemberDto
    {
        public Guid UserId { get; set; } 
        public string Username { get; set; } = string.Empty; 

    }

    public class UserGroupDto
    {
        public Guid? Id { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public List<UserGroupMemberDto>? Members { get; set; } = new List<UserGroupMemberDto>();

    }

    public class UserGroupMemberDto
    {
        //public Guid UserGroupId { get; set; }       
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}
