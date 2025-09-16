using Microsoft.AspNetCore.SignalR;

namespace lsa_web_apis.Services;

public class RadioInfoHub(IRadioInfoService radioInfoService) : Hub
{
    public bool IsCheckScheduleOn { get; set; } = false;
    public HashSet<string> ConnectedClients { get; set; } = [];

    private readonly IRadioInfoService _radioInfoService = radioInfoService;
    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
        ConnectedClients.Add(Context.ConnectionId);

        if (!IsCheckScheduleOn)
            StartCheckSchedule();
        else
            await Clients.Caller.SendAsync(Constants.NewTrackInfoNotification, _radioInfoService.CurrentTrackInfo);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
        ConnectedClients.Remove(Context.ConnectionId);

        if (ConnectedClients.Count == 0)
            StopCheckSchedule();
    }

    public async Task UpdateTrackInfo()
    {
        await _radioInfoService.UpdateCurrentTrackInfo();
        await Clients.All.SendAsync(Constants.NewTrackInfoNotification, _radioInfoService.CurrentTrackInfo);
    }

    public async void StartCheckSchedule()
    {
        if (IsCheckScheduleOn) return;
        IsCheckScheduleOn = true;
        await UpdateTrackInfo();
        while (IsCheckScheduleOn)
        {
            await Task.Delay(30000);
            await UpdateTrackInfo();
        }
    }

    public void StopCheckSchedule()
    {
        IsCheckScheduleOn = false;
    }
}
