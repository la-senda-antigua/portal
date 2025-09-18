using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace lsa_web_apis.Services;

public class RadioInfoHub(IRadioInfoService radioInfoService) : Hub
{
    private static readonly ConcurrentDictionary<string, byte> ConnectedClients = new();
    private readonly IRadioInfoService _radioInfoService = radioInfoService;
    private static readonly object _lock = new();

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
        ConnectedClients.TryAdd(Context.ConnectionId, 0);

        if (!_radioInfoService.IsScheduleOn)
            _radioInfoService.StartSchedule();

        await Clients.Caller.SendAsync(Constants.NewTrackInfoNotification, _radioInfoService.CurrentTrackInfo);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
        ConnectedClients.TryRemove(Context.ConnectionId, out _);

        if (ConnectedClients.IsEmpty)
            _radioInfoService.StopSchedule();
    }
}
