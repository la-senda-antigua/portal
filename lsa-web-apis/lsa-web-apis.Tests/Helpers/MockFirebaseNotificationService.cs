using lsa_web_apis.Services;
using Moq;

namespace lsa_web_apis.Tests.Helpers
{
    public static class MockFirebaseNotificationService
    {
        public static IFirebaseNotificationService GetMock()
        {
            var mock = new Mock<IFirebaseNotificationService>();
            mock.Setup(x => x.SendMulticastAsync(
                It.IsAny<IEnumerable<string>>(),
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
                .ReturnsAsync(new FirebaseAdmin.Messaging.BatchResponse(new List<FirebaseAdmin.Messaging.SendResponse>(), 0, 0));
            return mock.Object;
        }
    }
}
