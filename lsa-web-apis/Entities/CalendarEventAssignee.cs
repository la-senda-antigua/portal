
using System.ComponentModel.DataAnnotations.Schema;

namespace lsa_web_apis.Entities
{
    public class CalendarEventAssignee
    {
        public Guid CalendarEventId { get; set; }
        public Guid UserId { get; set; }
        
        public CalendarEvent CalendarEvent { get; set; } = new CalendarEvent();
        public User User { get; set; } = new User();

    }
}
