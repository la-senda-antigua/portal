using System;

namespace lsa_web_apis.Services;

public interface ILiveService
{
    public Task<DateTime> StartService(string videoURL);
    public Task EndService();
    public DateTime Add30Mins();
}
