using System;

namespace lsa_web_apis.Services;

public interface ILiveService
{
    public Task StartService(string videoURL);
    public Task EndService();
    public void ResetTimer();
}
