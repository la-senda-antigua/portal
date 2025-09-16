using lsa_web_apis.Models;
using Microsoft.AspNetCore.SignalR;

namespace lsa_web_apis.Services;

public class RadioInfoService : IRadioInfoService
{
    private readonly RadioTrackInfo _currentTrackInfo = new() { Artist = "", Title = "", Album = "" };

    RadioTrackInfo IRadioInfoService.CurrentTrackInfo => _currentTrackInfo;

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
    }



}
