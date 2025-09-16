using lsa_web_apis.Models;

namespace lsa_web_apis.Services;

public interface IRadioInfoService
{
    public RadioTrackInfo CurrentTrackInfo { get; }
    public Task UpdateCurrentTrackInfo();
}
