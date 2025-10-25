using System.Net;
using System.Net.Http.Json;
using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace lsa_web_apis.Tests.Apis;

public class CalendarsApiTests : IClassFixture<CustomWebApplicationFactory>
{
    [Fact]
    public async Task GetAll_ReturnsAllCalendars_ForAdminUser()
    {
        using var factory = new CustomWebApplicationFactory();
        factory.TestUserRole = "Admin";
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/calendars");
        var content = await response.Content.ReadAsStringAsync();

        Assert.True(response.IsSuccessStatusCode, $"Request failed with content: {content}");

        var calendars = await response.Content.ReadFromJsonAsync<List<Calendar>>();
        Assert.NotNull(calendars);
    }

    [Fact]
    public async Task Post_CreatesNewCalendar()
    {
        using var factory = new CustomWebApplicationFactory();
        factory.TestUserRole = "Admin";
        var client = factory.CreateClient();

        using var scope = factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<UserDbContext>();
        var originalNItems = context.Calendars.Count();

        var newCalendar = new Calendar
        {
            Name = $"Nuevo calendario de prueba {DateTime.Now}",
            Active = true
        };

        var response = await client.PostAsJsonAsync("/api/calendars", newCalendar);
        var content = await response.Content.ReadAsStringAsync();

        Assert.True(response.IsSuccessStatusCode, $"Request failed with content: {content}");
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var created = await response.Content.ReadFromJsonAsync<Calendar>();
        Assert.NotNull(created);

        var finalNItems = context.Calendars.Count();
        Assert.Equal(originalNItems + 1, finalNItems);
    }

    [Fact]
    public async Task Delete_Calendar()
    {
        using var factory = new CustomWebApplicationFactory();
        factory.TestUserRole = "Admin";
        var client = factory.CreateClient();

        using var scope = factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<UserDbContext>();

        var calendar = new Calendar
        {
            Name = "Calendario temporal para eliminar",
            Active = true
        };

        context.Calendars.Add(calendar);
        await context.SaveChangesAsync();

        var response = await client.DeleteAsync($"/api/calendars/{calendar.Id}");
        var content = await response.Content.ReadAsStringAsync();

        Assert.True(response.IsSuccessStatusCode, $"Request failed with content: {content}");
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        context.Entry(calendar).State = EntityState.Detached;
        var deleted = await context.Calendars.FindAsync(calendar.Id);
        Assert.Null(deleted);
    }

    [Fact]
    public async Task Put_UpdatesCalendar_ForAdminUser()
    {
        using var factory = new CustomWebApplicationFactory();
        factory.TestUserRole = "Admin";
        var client = factory.CreateClient();

        //Add New
        using var scope = factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<UserDbContext>();
        var calendar = new Calendar
        {
            Name = "Calendario original",
            Active = true
        };
        context.Calendars.Add(calendar);
        await context.SaveChangesAsync();

        //Update
        var updatedDto = new CalendarDto
        {
            Name = $"Calendario actualizado {DateTime.Now}",
            Active = false
        };
        var response = await client.PutAsJsonAsync($"/api/calendars/{calendar.Id}", updatedDto);
        var content = await response.Content.ReadAsStringAsync();

        Assert.True(response.IsSuccessStatusCode, $"Request failed with content: {content}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        context.Entry(calendar).State = EntityState.Detached;
        var updatedCalendar = await context.Calendars.FindAsync(calendar.Id);
        Assert.NotNull(updatedCalendar);
        Assert.Equal(updatedDto.Name, updatedCalendar.Name);
        Assert.Equal(updatedDto.Active, updatedCalendar.Active);
    }


    [Fact]
    public async Task GetAll_ReturnsForbidden_ForNonAdminUser()
    {
        using var factory = new CustomWebApplicationFactory();
        factory.TestUserRole = "User";
        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/calendars");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

}
