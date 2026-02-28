using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FirebaseAdmin.Messaging;

namespace lsa_web_apis.Services
{
    public interface IFirebaseNotificationService
    {
        Task<BatchResponse> SendMulticastAsync(
            IEnumerable<string> tokens,
            string title,
            string body,
            CancellationToken cancellationToken = default);
    }

    public class FirebaseNotificationService : IFirebaseNotificationService
    {
        public async Task<BatchResponse> SendMulticastAsync(
            IEnumerable<string> tokens,
            string title,
            string body,
            CancellationToken cancellationToken = default)
        {
            var tokenList = tokens.ToList();
            var message = new MulticastMessage
            {
                Tokens = tokenList,
                Notification = new Notification
                {
                    Title = title,
                    Body = body
                }
            };
            return await FirebaseMessaging.DefaultInstance.SendEachForMulticastAsync(message, cancellationToken);
        }
    }
}
