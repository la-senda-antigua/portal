using Microsoft.AspNetCore.SignalR;

namespace lsa_web_apis.Services;

public class LiveServiceHub : Hub
{
    private static bool _isOn = false;
    private static string? _videoURL = null;

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
        if (_isOn)
        {
            await Clients.Caller.SendAsync(Constants.LSAServiceStartedNotification, _videoURL);
        }
    }

    public static void StartService(string videoURL)
    {
        _isOn = true;
        _videoURL = videoURL;
    }

    public static void EndService()
    {
        _isOn = false;
        _videoURL = null;
    }
}
