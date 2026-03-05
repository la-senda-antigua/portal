using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;

namespace lsa_web_apis.Extensions;

public static class RequestLoggingHelper
{
    public static string GetPrefix<TController>(string actionName)
    {
        var controllerName = typeof(TController).Name.Replace("Controller", string.Empty);
        return $"{controllerName}/{actionName}";
    }

    public static string GetRequestedBy(ClaimsPrincipal user)
    {
        var username = user.FindFirst(ClaimTypes.Name)?.Value ?? user.Identity?.Name ?? "Anonymous";
        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "N/A";
        return $"{username} ({userId})";
    }

    public static RequestLogContext CreateContext<TController>(ILogger logger, ClaimsPrincipal user, string actionName, Guid? transactionId = null)
    {
        return new RequestLogContext(
            logger,
            GetPrefix<TController>(actionName),
            transactionId ?? Guid.NewGuid(),
            GetRequestedBy(user)
        );
    }
}

public sealed class RequestLogContext
{
    private readonly ILogger _logger;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };
    private const int MaxJsonLength = 4000;

    public string Prefix { get; }
    public Guid TransactionId { get; }
    public string RequestedBy { get; }

    public RequestLogContext(ILogger logger, string prefix, Guid transactionId, string requestedBy)
    {
        _logger = logger;
        Prefix = prefix;
        TransactionId = transactionId;
        RequestedBy = requestedBy;
    }

    public void Info(string message, params object?[] args)
        => _logger.LogInformation(BuildMessage(message), BuildArgs(args));

    public void Warning(string message, params object?[] args)
        => _logger.LogWarning(BuildMessage(message), BuildArgs(args));

    public void Debug(string message, params object?[] args)
        => _logger.LogDebug(BuildMessage(message), BuildArgs(args));

    public void Error(Exception exception, string message, params object?[] args)
        => _logger.LogError(exception, BuildMessage(message), BuildArgs(args));

    public void InfoJson(string message, object? payload)
        => Info($"{message} PayloadJson: {{PayloadJson}}", SerializePayload(payload));

    public void ErrorJson(Exception exception, string message, object? payload)
        => Error(exception, $"{message} PayloadJson: {{PayloadJson}}", SerializePayload(payload));

    private string BuildMessage(string message)
        => $"{Prefix} [TransactionId: {{TransactionId}}] {message} RequestedBy: {{RequestedBy}}";

    private object?[] BuildArgs(object?[] args)
    {
        var mergedArgs = new object?[args.Length + 2];
        Array.Copy(args, mergedArgs, args.Length);
        mergedArgs[args.Length] = TransactionId;
        mergedArgs[args.Length + 1] = RequestedBy;
        return mergedArgs;
    }

    private static string SerializePayload(object? payload)
    {
        if (payload is null)
            return "null";

        try
        {
            var json = JsonSerializer.Serialize(payload, JsonOptions);
            if (json.Length <= MaxJsonLength)
                return json;

            return $"{json.Substring(0, MaxJsonLength)}... [truncated]";
        }
        catch (Exception ex)
        {
            return $"[serialization-error: {ex.Message}]";
        }
    }
}