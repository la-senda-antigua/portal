using lsa_web_apis.Models;
using Microsoft.AspNetCore.SignalR;

namespace lsa_web_apis.Services;

public class RadioInfoService(IHubContext<RadioInfoHub> hubContext) : IRadioInfoService
{
    private readonly RadioTrackInfo _currentTrackInfo = new();
    private CancellationTokenSource? _cts;
    private bool _isScheduleOn = false;
    public bool IsScheduleOn => _isScheduleOn;
    public RadioTrackInfo CurrentTrackInfo => _currentTrackInfo;
    private readonly IHubContext<RadioInfoHub> _hubContext = hubContext;

    public async Task UpdateCurrentTrackInfo()
    {
        using var httpClient = new HttpClient();
        try
        {
            var response = await httpClient.GetAsync("http://radio45.virtualtronics.com:2199/external/rpc.php?m=streaminfo.get&username=lasenda&rid=lasenda");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            var contentJson = System.Text.Json.JsonDocument.Parse(content);
            var track = contentJson.RootElement.GetProperty("data")[0].GetProperty("track");
            _currentTrackInfo.Artist = track.GetProperty("artist").GetString() ?? "";
            _currentTrackInfo.Title = track.GetProperty("title").GetString() ?? "";
            _currentTrackInfo.Album = track.GetProperty("album").GetString() ?? "";
        }
        catch
        {
            _currentTrackInfo.Artist = "";
            _currentTrackInfo.Title = "";
            _currentTrackInfo.Album = "";
        }
        OnTrackInfoChanged(_currentTrackInfo);
    }

    protected virtual async void OnTrackInfoChanged(RadioTrackInfo info)
    {
        await _hubContext.Clients.All.SendAsync(Constants.NewTrackInfoNotification, info);
    }

    public void StartSchedule()
    {
        if (_isScheduleOn) return;
        _isScheduleOn = true;
        _cts = new CancellationTokenSource();
        var token = _cts.Token;

        _ = Task.Run(async () =>
        {
            while (_isScheduleOn && !token.IsCancellationRequested)
            {
                await UpdateCurrentTrackInfo();
                await Task.Delay(15000, token);
            }
        }, token);
    }

    public void StopSchedule()
    {
        _isScheduleOn = false;
        _cts?.Cancel();
        _cts?.Dispose();
        _cts = null;
    }
}
