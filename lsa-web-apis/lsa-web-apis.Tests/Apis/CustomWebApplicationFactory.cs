using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using lsa_web_apis.Tests.Auth;
using Microsoft.AspNetCore.Hosting;

namespace lsa_web_apis.Tests.Apis;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    public string TestUserRole { get; set; } = "Admin";
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            services.RemoveAll(typeof(AuthenticationSchemeOptions));
            services.AddAuthentication("Test")
                .AddScheme<FakeAuthHandlerOptions, FakeAuthHandlerForTest>("Test", options =>
                {
                    options.Role = TestUserRole;
                });

        });
    }
}
