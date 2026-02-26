using System;

namespace lsa_web_apis.Entities;

public class NotificationLog
{
    public int Id { get; set; }
    public Guid EventId { get; set; }
    public Guid UserId { get; set; }
    public string NotificationType { get; set; } = string.Empty;
    public DateTime SentAt { get; set; } = DateTime.Now;

    public virtual User? User { get; set; }
}
