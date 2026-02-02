using System.Timers;
using lsa_web_apis.Models;
using Microsoft.AspNetCore.SignalR;

namespace lsa_web_apis.Services;

public class LiveService : ILiveService
{
    private readonly System.Timers.Timer _timer = new(Constants.LSAServiceTimeout);
    private readonly ElapsedEventHandler _elapsedHandler;
    private readonly IHubContext<LiveServiceHub> _hubContext;
    // Lock to guard timer operations to avoid races between the timer's Elapsed
    // handler and incoming requests that modify the timer/state.
    private readonly object _timerLock = new();

    public LiveService(IHubContext<LiveServiceHub> hubContext)
    {
        _hubContext = hubContext;
        _elapsedHandler = (sender, e) => EndService();
    }

    public async Task<LiveServiceStateDto> StartService(string videoURL)
    {
        var dateWhenElapsed = DateTime.Now.AddMilliseconds(Constants.LSAServiceTimeout);

        // Update hub state and timer under a lock so the timer cannot elapse
        // while we're configuring it.
        lock (_timerLock)
        {
            if (_timer.Enabled)
                _timer.Stop();
            else
                _timer.Elapsed += _elapsedHandler;

            LiveServiceHub.StartService(videoURL, dateWhenElapsed);

            // Make the timer interval match the exact remaining time.
            var ms = (dateWhenElapsed - DateTime.Now).TotalMilliseconds;
            _timer.Interval = ms > 0 ? ms : 0.0;
            _timer.Start();
        }

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
        // Stop and update the timer atomically with hub state update.
        LiveServiceStateDto serviceStatus;
        lock (_timerLock)
        {
            if (_timer.Enabled)
                _timer.Stop();

            serviceStatus = LiveServiceHub.Add30Mins();

            if (serviceStatus.EndTime.HasValue && serviceStatus.EndTime.Value > DateTime.Now)
            {
                var ms = (serviceStatus.EndTime.Value - DateTime.Now).TotalMilliseconds;
                _timer.Interval = ms > 0 ? ms : 0.0;
                _timer.Start();
            }
        }

        return serviceStatus;
    }

    public LiveServiceStateDto GetServiceStatus()
    {
        return LiveServiceHub.GetServiceStatus();
    }

    public Task EndService()
    {
        // Update hub state and timer under a lock, then notify clients.
        lock (_timerLock)
        {
            LiveServiceHub.EndService();
            if (_timer.Enabled)
            {
                _timer.Stop();
                _timer.Elapsed -= _elapsedHandler;
            }
        }

        return _hubContext.Clients.All.SendAsync(Constants.LSAServiceEndedNotification);
    }

}
