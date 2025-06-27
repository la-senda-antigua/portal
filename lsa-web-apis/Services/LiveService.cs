using System.Timers;
using lsa_web_apis.Models;
using Microsoft.AspNetCore.SignalR;

namespace lsa_web_apis.Services;

public class LiveService : ILiveService
{
    private readonly System.Timers.Timer _timer = new(Constants.LSAServiceTimeout);
    private readonly ElapsedEventHandler _elapsedHandler;
    private readonly IHubContext<LiveServiceHub> _hubContext;

    public LiveService(IHubContext<LiveServiceHub> hubContext)
    {
        _hubContext = hubContext;
        _elapsedHandler = (sender, e) => EndService();
    }

    public async Task<LiveServiceStateDto> StartService(string videoURL)
    {
        if (_timer.Enabled)
            _timer.Stop();
        else
            _timer.Elapsed += _elapsedHandler;

        var dateWhenElapsed = DateTime.Now.AddMilliseconds(Constants.LSAServiceTimeout);
        LiveServiceHub.StartService(videoURL, dateWhenElapsed);
        _timer.Start();
        await _hubContext.Clients.All.SendAsync(Constants.LSAServiceStartedNotification, videoURL);
        return new LiveServiceStateDto
        {
            IsOn = true,
            VideoURL = videoURL,
            EndTime = dateWhenElapsed
        };
    }

    public LiveServiceStateDto Add30Mins()
    {
        _timer.Stop();
        var serviceStatus = LiveServiceHub.Add30Mins();
        if (serviceStatus.EndTime.HasValue && serviceStatus.EndTime.Value > DateTime.Now)
        {
            _timer.Interval = (serviceStatus.EndTime.Value - DateTime.Now).TotalMilliseconds;
            _timer.Start();
        }

        return serviceStatus;
    }

    public LiveServiceStateDto GetServiceStatus()
    {
        return LiveServiceHub.GetServiceStatus();
    }

    public Task EndService()
    {
        LiveServiceHub.EndService();
        if (_timer.Enabled)
        {
            _timer.Stop();
            _timer.Elapsed -= _elapsedHandler;
        }
        return _hubContext.Clients.All.SendAsync(Constants.LSAServiceEndedNotification);
    }

}
