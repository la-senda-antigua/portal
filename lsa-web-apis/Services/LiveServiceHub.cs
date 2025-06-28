using lsa_web_apis.Models;
using Microsoft.AspNetCore.SignalR;

namespace lsa_web_apis.Services;

public class LiveServiceHub : Hub
{
    private static bool _isOn = false;
    private static string? _videoURL = null;
    private static DateTime? _endTime = null;

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
        _isOn = true;
        _videoURL = videoURL;
        _endTime = endTime;
    }

    public static void EndService()
    {
        _isOn = false;
        _videoURL = null;
        _endTime = null;
    }

    public static LiveServiceStateDto Add30Mins()
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
        return new LiveServiceStateDto
        {
            IsOn = false,
            VideoURL = null,
            EndTime = null
        };
    }

    public static LiveServiceStateDto GetServiceStatus()
    {
        return new LiveServiceStateDto
        {
            IsOn = _isOn,
            VideoURL = _videoURL,
            EndTime = _endTime
        };
    }
}
