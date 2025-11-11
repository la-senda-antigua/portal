using System.Security.Claims;
using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Extensions;
using lsa_web_apis.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace lsa_web_apis.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class CalendarsController(UserDbContext _context) : ControllerBase
    {
        [Authorize(Roles = "Admin,CalendarManager")]
        [HttpGet]
        public async Task<ActionResult<PagedResult<Preacher>>> GetCalendars([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchTerm = "")
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
            var calendar = await _context.Calendars.FindAsync(id);
            if (calendar is null)
                return NotFound("Calendar not found.");

            calendar.Name = dto.Name;
            calendar.Active = dto.Active;

            await _context.SaveChangesAsync();
            return Ok(calendar);
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
        [Authorize(Roles = "Admin,CalendarManager")]
        public async Task<ActionResult<PagedResult<CalendarDto>>> GetByUserId(int page = 1, int pageSize = 10, string searchTerm = "")
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            IQueryable<Calendar> baseQuery = User.IsInRole("Admin")
                ? _context.Calendars
                : _context.Calendars.Where(c => c.Managers.Any(m => m.UserId == userId));

            if (!string.IsNullOrWhiteSpace(searchTerm))
                baseQuery = baseQuery.Where(c => EF.Functions.Like(c.Name!, $"%{searchTerm}%"));

            var paged = await baseQuery
                .OrderBy(c => c.Name)
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
                    }).ToList()
                })
                .ToPagedResultAsync(page, pageSize);

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

        [HttpGet("{id}/events")]
        [Authorize(Roles = "Admin,CalendarManager")]
        public async Task<ActionResult<PagedResult<CalendarEventDto>>> GetUpcomingEvents(Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var now = DateTime.UtcNow;

            var pagedEvents = await _context.Calendars
                .Where(c => c.Id == id)
                .SelectMany(c => c.Events)
                .Where(e => e.EventDate >= now)
                .OrderBy(e => e.EventDate)
                .Select(e => new CalendarEventDto
                {
                    Title = e.Title,
                    Description = e.Description,
                    EventDate = e.EventDate,
                    CalendarId = e.CalendarId,
                    Date = e.Date,
                    StartTime = e.StartTime,
                    EndTime = e.EndTime,
                    AlertDate = e.AlertDate
                })
                .ToPagedResultAsync(page, pageSize);

            return Ok(pagedEvents);
        }

        public record AddMemberRequest(Guid CalendarId, Guid UserId);

        [HttpPost]
        [Authorize(Roles = "Admin,CalendarManager")]
        [Route("addMember")]
        public async Task<ActionResult> AddMember(AddMemberRequest request)
        {
            var calendar = await _context.Calendars.FindAsync(request.CalendarId);
            if (calendar is null)
                return NotFound("Calendar not found.");

            var user = await _context.PortalUsers.FindAsync(request.UserId);
            if (user is null)
                return NotFound("User not found."); 

            var existingMember = await _context.CalendarMembers
                .FirstOrDefaultAsync(cm => cm.CalendarId == request.CalendarId && cm.UserId == request.UserId);
            if (existingMember is not null)
                return BadRequest("User is already a member of this calendar.");

            var calendarMember = new CalendarMember
            {
                CalendarId = request.CalendarId,
                UserId = request.UserId
            };
            _context.CalendarMembers.Add(calendarMember);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
