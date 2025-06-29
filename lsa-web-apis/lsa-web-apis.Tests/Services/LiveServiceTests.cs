using lsa_web_apis.Services;
using Moq;
using Microsoft.AspNetCore.SignalR;
namespace lsa_web_apis.Tests.Services;



public class LiveServiceTests
{
    private readonly Mock<IClientProxy> _mockClientProxy;
    private readonly Mock<IHubContext<LiveServiceHub>> _mockHubContext;
    private readonly ILiveService _liveService;

    public LiveServiceTests()
    {
        _mockClientProxy = new Mock<IClientProxy>();
        _mockClientProxy.Setup(m => m.SendCoreAsync(Constants.LSAServiceStartedNotification, It.IsAny<object[]>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask).Verifiable();

        var mockClients = new Mock<IHubClients>();
        mockClients.Setup(m => m.All).Returns(_mockClientProxy.Object);

        _mockHubContext = new Mock<IHubContext<LiveServiceHub>>();
        _mockHubContext.Setup(m => m.Clients).Returns(mockClients.Object);
        _liveService = new LiveService(_mockHubContext.Object);
    }


    [Fact]
    public async Task LiveService_StartsSuccessfully()
    {
        string videoURL = "http://example.com/video";
        var result = await _liveService.StartService(videoURL);
        Assert.True(result.VideoURL == videoURL);
        Assert.True(result.IsOn);
        Assert.True(result.EndTime > DateTime.Now);
        _mockClientProxy.Verify(m => m.SendCoreAsync(Constants.LSAServiceStartedNotification, It.Is<object[]>(o => o[0].ToString() == videoURL), It.IsAny<CancellationToken>()), Times.Once);
        await _liveService.EndService();
    }

    [Fact]
    public async Task LiveService_Adds30MinsSuccessfully()
    {
        string videoURL = "http://example.com/video";
        var result = await _liveService.StartService(videoURL);
        var initialEndTime = result.EndTime;
        var updatedResult = _liveService.Add30Mins();
        Assert.True(updatedResult.VideoURL == videoURL);
        Assert.True(updatedResult.IsOn);
        Assert.True(updatedResult.EndTime > initialEndTime);
        Assert.True(updatedResult.EndTime - initialEndTime == TimeSpan.FromMinutes(30));
        await _liveService.EndService();
    }


}
