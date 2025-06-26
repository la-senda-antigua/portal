using System.Timers;
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

    public async Task<DateTime> StartService(string videoURL)
    {
        LiveServiceHub.StartService(videoURL);
        if (_timer.Enabled)
        {
            _timer.Stop();
            _timer.Interval = Constants.LSAServiceTimeout;
        }
        else
        {
            _timer.Elapsed += _elapsedHandler;
        }
        var dateWhenElapsed = DateTime.Now.AddMilliseconds(Constants.LSAServiceTimeout);
        _timer.Start();
        await _hubContext.Clients.All.SendAsync(Constants.LSAServiceStartedNotification, videoURL);
        return dateWhenElapsed;
    }

    public DateTime Add30Mins()
    {
        if (_timer.Enabled)
        {
            _timer.Stop();
            _timer.Interval += TimeSpan.FromMinutes(30).TotalMilliseconds;
            var dateWhenElapsed = DateTime.Now.AddMilliseconds(_timer.Interval);
            _timer.Start();
            return dateWhenElapsed;
        }
        return DateTime.Now;
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
