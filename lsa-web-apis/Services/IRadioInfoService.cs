using lsa_web_apis.Models;

namespace lsa_web_apis.Services;

public interface IRadioInfoService
{
    public RadioTrackInfo CurrentTrackInfo { get; }
    public bool IsScheduleOn { get; }
    public Task UpdateCurrentTrackInfo();
    public void StartSchedule();
    public void StopSchedule();
}
