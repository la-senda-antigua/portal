using lsa_web_apis.Models;

namespace lsa_web_apis.Services;

public class RadioInfoService : IRadioInfoService
{
    public async Task<RadioTrackInfo> GetCurrentTrackInfo()
    {
        using var httpClient = new HttpClient();
        try
        {
            var response = await httpClient.GetAsync("http://radio45.virtualtronics.com:2199/external/rpc.php?m=streaminfo.get&username=lasenda&rid=lasenda");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            var contentJson = System.Text.Json.JsonDocument.Parse(content);
            var track = contentJson.RootElement.GetProperty("data")[0].GetProperty("track");
            var trackInfo = new RadioTrackInfo()
            {
                Artist = track.GetProperty("artist").GetString() ?? "",
                Title = track.GetProperty("title").GetString() ?? "",
                Album = track.GetProperty("album").GetString() ?? ""
            };
            return trackInfo;
        }
        catch
        {
            return new RadioTrackInfo { Artist = "", Title = "", Album = "" };
        }
    }
}
