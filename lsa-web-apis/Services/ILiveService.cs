using System;
using lsa_web_apis.Models;

namespace lsa_web_apis.Services;

public interface ILiveService
{
    public Task<LiveServiceStateDto> StartService(string videoURL);
    public Task EndService();
    public LiveServiceStateDto Add30Mins();
    public LiveServiceStateDto GetServiceStatus();
}
