namespace lsa_web_apis;

public static class Constants
{
    public const string LSAServiceStartedNotification = "service-started";
    public const string LSAServiceEndedNotification = "service-ended";
    public const int LSAServiceTimeout = (int)(1000 * 60 * 60 * 2.5); // 2.5 hours in milliseconds
    public const string NewTrackInfoNotification = "newTrackInfo";
}
