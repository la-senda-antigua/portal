using System.Security.Claims;
using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Extensions;
using lsa_web_apis.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Ocsp;

namespace lsa_web_apis.Controllers
{
  [Route("[controller]")]
  [ApiController]
  public class CalendarsController(UserDbContext _context) : ControllerBase
  {
    [Authorize(Roles = "Admin,CalendarManager")]
    [HttpGet]
    public async Task<ActionResult<PagedResult<Calendar>>> GetCalendars([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchTerm = "")
    {
      if (string.IsNullOrEmpty(searchTerm))
      {
        var pagedResult = await _context.Calendars
        .OrderBy(c => c.Id)
        .ToPagedResultAsync(page, pageSize);

        return Ok(pagedResult);
      }

      var result = await _context.Calendars
          .Where(c => !string.IsNullOrEmpty(c.Name) && EF.Functions.Like(c.Name, $"%{searchTerm}%"))
          .ToPagedResultAsync(page, pageSize);

      return Ok(result);

    }

    [Authorize(Roles = "Admin,CalendarManager")]
    [HttpGet]
    [Route("getAll")]
    public async Task<ActionResult<List<Calendar>>> GetAll()
    {
      var calendars = await _context.Calendars.ToListAsync();
      return Ok(calendars);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,CalendarManager")]
    public async Task<ActionResult<Calendar>> Add([FromBody] CalendarDto dto)
    {
      var calendar = new Calendar
      {
        Id = Guid.NewGuid(),
        Name = dto.Name,
        Active = dto.Active
      };

      _context.Calendars.Add(calendar);
      await _context.SaveChangesAsync();

      return CreatedAtAction(nameof(GetAll), new { id = calendar.Id }, calendar);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,CalendarManager")]
    public async Task<ActionResult<Calendar>> Edit(Guid id, [FromBody] CalendarDto dto)
    {
      // Use transactions if not in UnitTests
      var useTransaction = !_context.Database.IsInMemory();
      if (useTransaction)
        await _context.Database.BeginTransactionAsync();

      try
      {
        var calendar = await _context.Calendars.FindAsync(id);
        if (calendar is null)
          return NotFound("Calendar not found.");

        calendar.Name = dto.Name;
        calendar.Active = dto.Active;

        var managerIds = new HashSet<Guid>(dto.Managers?.Select(m => m.UserId) ?? new List<Guid>());

        // Remove existing members
        var existingMembers = await _context.CalendarMembers
            .Where(cm => cm.CalendarId == id)
            .ToListAsync();
        _context.CalendarMembers.RemoveRange(existingMembers);

        // Remove existing managers
        var existingManagers = await _context.CalendarManagers
            .Where(cm => cm.CalendarId == id)
            .ToListAsync();
        _context.CalendarManagers.RemoveRange(existingManagers);

        // Add new members (excluding those who are managers)
        if (dto.Members != null && dto.Members.Any())
        {
          var newMembers = dto.Members
              .Where(member => !managerIds.Contains(member.UserId))
              .Select(member => new CalendarMember
              {
                CalendarId = id,
                UserId = member.UserId
              }).ToList();

          await _context.CalendarMembers.AddRangeAsync(newMembers);
        }

        // Add new managers
        if (dto.Managers != null && dto.Managers.Any())
        {
          var newManagers = dto.Managers.Select(member => new CalendarManager
          {
            CalendarId = id,
            UserId = member.UserId
          }).ToList();

          await _context.CalendarManagers.AddRangeAsync(newManagers);
        }

        await _context.SaveChangesAsync();

        if (useTransaction)
          await _context.Database.CommitTransactionAsync();

        return Ok(calendar);
      }
      catch
      {
        if (useTransaction)
          await _context.Database.RollbackTransactionAsync();
        return StatusCode(500, "An error occurred while updating the calendar.");
      }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,CalendarManager")]
    public async Task<IActionResult> Delete(Guid id)
    {
      var calendar = await _context.Calendars.FindAsync(id);
      if (calendar is null)
        return NotFound("Calendar not found.");

      _context.Calendars.Remove(calendar);
      await _context.SaveChangesAsync();

      return NoContent();
    }

    [HttpGet("myCalendars")]
    [Authorize]
    public async Task<ActionResult<List<CalendarDto>>> GetByUserId()
    {
      var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
      IQueryable<Calendar> baseQuery = User.IsInRole("Admin")
          ? _context.Calendars
          : _context.Calendars.Where(c => c.Managers.Any(m => m.UserId == userId) || c.Members.Any(m => m.UserId == userId));

      var paged = await baseQuery
          .OrderBy(c => c.Name)
          .Select(c => new CalendarDto
          {
            Id = c.Id,
            Name = c.Name!,
            Active = c.Active,
          }).ToListAsync();

      return Ok(paged);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,CalendarManager")]
    public async Task<ActionResult<CalendarDto>> GetById(Guid id)
    {
      var calendar = await _context.Calendars
          .Where(c => c.Id == id)
          .Select(c => new CalendarDto
          {
            Id = c.Id,
            Name = c.Name!,
            Active = c.Active,
            Managers = c.Managers.Select(m => new CalendarManagerDto
            {
              CalendarId = m.CalendarId,
              Username = m.User.Username,
              UserId = m.User.Id
            }).ToList(),
            Members = c.Members.Select(m => new CalendarMemberDto
            {
              UserId = m.UserId,
              Username = m.User.Username
            }).ToList()
          })
          .FirstOrDefaultAsync();

      if (calendar is null)
        return NotFound("Calendar not found.");

      return Ok(calendar);
    }

    [HttpGet("events")]
    [Authorize(Roles = "Admin,CalendarManager")]
    public async Task<ActionResult<PagedResult<CalendarEventDto>>> GetEventsByMonth(int month, int year)
    {
      var yearMonth = $"{year:D4}-{month:D2}";

      var query = _context.CalendarEvents
          .Where(e => e.StartTime != null && e.StartTime.Substring(0, 7) == yearMonth);

      if (!User.IsInRole("Admin"))
      {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        query = query.Where(e => e.Calendar.Managers.Any(m => m.UserId == userId));
      }

      var result = await query
          .Select(e => new CalendarEventDto
          {
            Id = e.Id,
            Title = e.Title,
            Description = e.Description,
            CalendarId = e.CalendarId,
            Start = e.StartTime,
            End = e.EndTime,
            AllDay = e.AllDay
          })
          .OrderByDescending(e => e.Start)
          .AsNoTracking()
          .ToListAsync();

      return Ok(result);
    }

    public record MobileEventRequest(int month, int year, List<Guid> calendarIds);

    [HttpPost("GetEventsByMonth")]
    [Authorize]
    public async Task<ActionResult<List<CalendarEventDto>>> GetEventsByMonth(MobileEventRequest request)
    {
      var monthStart = new DateTime(request.year, request.month, 1);
      var monthEnd = monthStart.AddMonths(1).AddDays(-1);
      var monthStartStr = monthStart.ToString("yyyy-MM-dd");
      var monthEndStr = monthEnd.ToString("yyyy-MM-dd") + " 23:59:59";

      var query = _context.CalendarEvents.AsQueryable();

      if (!User.IsInRole("Admin"))
      {
        if (request.calendarIds == null || !request.calendarIds.Any())
          return new List<CalendarEventDto>();

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        query = query.Where(
          e => (e.Calendar.Managers.Any(m => m.UserId == userId) || e.Calendar.Members.Any(m => m.UserId == userId))
          && request.calendarIds.Contains(e.CalendarId)
        );
      }

      // Filter overlapping events
      query = query.Where(e =>
          e.StartTime != null &&
          e.StartTime.CompareTo(monthEndStr) <= 0 &&
          (e.EndTime == null || e.EndTime.CompareTo(monthStartStr) >= 0)
      );

      var rawEvents = await query.AsNoTracking().ToListAsync();
      var result = new List<dynamic>();

      foreach (var e in rawEvents)
      {
        if (!DateTime.TryParse(e.StartTime, out var start)) continue;

        DateTime end = start;
        bool hasEnd = !string.IsNullOrEmpty(e.EndTime) && DateTime.TryParse(e.EndTime, out end);
        if (!hasEnd) end = start;

        int totalDays = (int)(end.Date - start.Date).TotalDays + 1;

        var intersectionStart = start.Date < monthStart.Date ? monthStart.Date : start.Date;
        var intersectionEnd = end.Date > monthEnd.Date ? monthEnd.Date : end.Date;

        for (var date = intersectionStart; date <= intersectionEnd; date = date.AddDays(1))
        {
          int currentDay = (int)(date - start.Date).TotalDays + 1;

          result.Add(new
          {
            e.Id,
            e.Title,
            e.Description,
            e.CalendarId,
            Start = date == start.Date ? e.StartTime : date.ToString("yyyy-MM-dd HH:mm:ss"),
            End = e.EndTime,
            e.AllDay,
            CurrentDay = currentDay,
            TotalDays = totalDays
          });
        }
      }

      return Ok(result.OrderBy(e => e.Start).ToList());
    }

    [HttpPost]
    [Authorize(Roles = "Admin,CalendarManager")]
    [Route("addEvent")]
    public async Task<ActionResult> AddEvent(CalendarEventDto request)
    {
      var calendar = await _context.Calendars.FindAsync(request.CalendarId);
      if (calendar is null) return NotFound("Calendar not found.");

      var calendarEvent = new CalendarEvent
      {
        Title = request.Title,
        Description = request.Description,
        CalendarId = request.CalendarId,
        StartTime = request.Start!.Replace("T", " "),
        AllDay = request.AllDay,
      };

      if (!string.IsNullOrEmpty(request.End))
      {
        calendarEvent.EndTime = request.End.Replace("T", " ");
      }

      _context.CalendarEvents.Add(calendarEvent);
      await _context.SaveChangesAsync();

      return Ok();
    }

    [HttpPut]
    [Authorize(Roles = "Admin,CalendarManager")]
    [Route("updateEvent")]
    public async Task<ActionResult> UpdateEvent(CalendarEventDto request)
    {
      var existingEvent = await _context.CalendarEvents.FindAsync(request.Id);
      if (existingEvent is null) return NotFound("Event not found.");

      var calendar = await _context.Calendars.FindAsync(request.CalendarId);
      if (calendar is null) return NotFound("Calendar not found.");

      existingEvent.Id = request.Id!.Value;
      existingEvent.Title = request.Title;
      existingEvent.Description = request.Description;
      existingEvent.CalendarId = request.CalendarId;
      existingEvent.StartTime = request.Start!.Replace("T", " ");
      existingEvent.AllDay = request.AllDay;
      if (!string.IsNullOrEmpty(request.End))
      {
        existingEvent.EndTime = request.End.Replace("T", " ");
      }

      await _context.SaveChangesAsync();
      return Ok();
    }

    [HttpGet]
    [Route("GetPublicEvents")]
    public async Task<ActionResult> GetPublicEvents(DateTime? dateTime)
    {
      if (dateTime is null)
        dateTime = DateTime.Now;
      //buscar el calendario con nombre "Public Events" y obtener sus eventos
      var calendar = await _context.Calendars.FirstOrDefaultAsync(c => c.Name == "Eventos Publicos");
      if (calendar == null)
      {
        return NotFound("Calendar not found");
      }

      var dateString = dateTime.Value.ToString("yyyy-MM-dd HH:mm:ss");

      var events = await _context.CalendarEvents
        .Where(e => string.Compare(e.StartTime, dateString) > 0 && e.CalendarId == calendar.Id)
        .OrderBy(e => e.StartTime)
        .Select(e => new CalendarEventDto
        {
          Id = e.Id,
          Title = e.Title,
          Description = e.Description,
          CalendarId = e.CalendarId,
          Start = e.StartTime,
          End = e.EndTime,
          AllDay = e.AllDay
        })
        .ToListAsync();
      return Ok(events);
    }
  }
}
