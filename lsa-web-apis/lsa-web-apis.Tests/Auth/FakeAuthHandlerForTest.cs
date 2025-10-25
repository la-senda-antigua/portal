using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;

namespace lsa_web_apis.Tests.Auth;

public class FakeAuthHandlerOptions : AuthenticationSchemeOptions
{
    public string Role { get; set; } = "Admin";
}

public class FakeAuthHandlerForTest : AuthenticationHandler<FakeAuthHandlerOptions>
{
    public FakeAuthHandlerForTest(
        IOptionsMonitor<FakeAuthHandlerOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        ISystemClock clock)
        : base(options, logger, encoder, clock) { }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, "Test User"),
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString())
        };

        if (!string.IsNullOrEmpty(Options.Role))
            claims.Add(new Claim(ClaimTypes.Role, Options.Role));

        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "Test");
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
