using System.Net.Http.Json;
using lsa_web_apis.Entities;

namespace lsa_web_apis.Tests.Apis;

public class CalendarsApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public CalendarsApiTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetAll_ReturnsAllCalendars_ForAdminUser()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/calendars");
        response.EnsureSuccessStatusCode();

        var calendars = await response.Content.ReadFromJsonAsync<List<Calendar>>();
        Assert.NotNull(calendars);
        Assert.True(calendars.Count == 0);
    }
}
