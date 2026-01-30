using lsa_web_apis.Models;
using Microsoft.AspNetCore.SignalR;

namespace lsa_web_apis.Services;

public class LiveServiceHub : Hub
{
    private static bool _isOn = false;
    private static string? _videoURL = null;
    private static DateTime? _endTime = null;
    // Lock to protect static hub state (_isOn, _videoURL, _endTime)
    private static readonly object _stateLock = new();

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
        if (_isOn)
        {
            await Clients.Caller.SendAsync(Constants.LSAServiceStartedNotification, _videoURL);
        }
    }

    public static void StartService(string videoURL, DateTime endTime)
    {
        lock (_stateLock)
        {
            _isOn = true;
            _videoURL = videoURL;
            _endTime = endTime;
        }
    }

    public static void EndService()
    {
        lock (_stateLock)
        {
            _isOn = false;
            _videoURL = null;
            _endTime = null;
        }
    }

    public static LiveServiceStateDto Add30Mins()
    {
        lock (_stateLock)
        {
            if (_isOn && _endTime.HasValue)
            {
                _endTime = _endTime.Value.AddMinutes(30);
                return new LiveServiceStateDto
                {
                    IsOn = true,
                    VideoURL = _videoURL,
                    EndTime = _endTime
                };
            }
        }
        return new LiveServiceStateDto
        {
            IsOn = false,
            VideoURL = null,
            EndTime = null
        };
    }

    public static LiveServiceStateDto GetServiceStatus()
    {
        lock (_stateLock)
        {
            return new LiveServiceStateDto
            {
                IsOn = _isOn,
                VideoURL = _videoURL,
                EndTime = _endTime
            };
        }
    }
}
