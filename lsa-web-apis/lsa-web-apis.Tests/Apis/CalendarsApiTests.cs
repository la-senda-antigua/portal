using System.Net.Http.Json;
using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using Microsoft.Extensions.DependencyInjection;

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
        var content = await response.Content.ReadAsStringAsync();

        Assert.True(response.IsSuccessStatusCode, $"Request failed with content: {content}");

        var calendars = await response.Content.ReadFromJsonAsync<List<Calendar>>();
        Assert.NotNull(calendars);
    }

    [Fact]
    public async Task GetAll_ReturnsCalendars_WhenThereAreCalendars()
    {
        var client = _factory.CreateClient();

        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<UserDbContext>();

        // Add calendar for test
        context.Calendars.Add(new Calendar
        {
            Id = Guid.NewGuid(),
            Name = "Calendar Test",
            Active = true
        });

        await context.SaveChangesAsync();

        // Get calendars
        var response = await client.GetAsync("/api/calendars");
        var content = await response.Content.ReadAsStringAsync();
        Assert.True(response.IsSuccessStatusCode, $"Request failed with content: {content}");

        var calendars = await response.Content.ReadFromJsonAsync<List<Calendar>>();
        Assert.NotNull(calendars);
        Assert.Single(calendars);
        Assert.Equal("Calendar Test", calendars[0].Name);
    }

    [Fact]
    public async Task GetAll_ReturnsForbidden_ForUserWithoutProperRole()
    {
        var client = _factory.CreateClient();        
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("TestUserRole");

        var response = await client.GetAsync("/api/calendars");        
        Assert.Equal(System.Net.HttpStatusCode.Forbidden, response.StatusCode);
    }

}
