using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using lsa_web_apis.Tests.Auth;

namespace lsa_web_apis.Tests.Apis;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Quitamos la autenticación real
            services.RemoveAll(typeof(AuthenticationSchemeOptions));

            // Agregamos nuestro handler de prueba
            services.AddAuthentication("Test")
                    .AddScheme<AuthenticationSchemeOptions, FakeAuthHandlerForTest>("Test", options => { });
        });
    }
}
