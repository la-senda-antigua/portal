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
        [Authorize(Roles = "Admin,CalendarManager")]
        public async Task<ActionResult<List<CalendarDto>>> GetByUserId()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            IQueryable<Calendar> baseQuery = User.IsInRole("Admin")
                ? _context.Calendars
                : _context.Calendars.Where(c => c.Managers.Any(m => m.UserId == userId));

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
        public async Task<ActionResult<PagedResult<CalendarEventDto>>> GetMonthEvents(int month, int year)
        {
            var query = _context.CalendarEvents.Where(e => e.EventDate.Month == month && e.EventDate.Year == year);
            if (!User.IsInRole("Admin"))
            {
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                query = query.Where(e => e.Calendar.Managers.Any(m => m.UserId == userId));
            }
            var result = await query.ToListAsync();
            return Ok(result);
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
                EventDate = request.EventDate,
                CalendarId = request.CalendarId,
                StartTime = request.Start,
            };

            if (request.End.HasValue) { calendarEvent.EndTime = request.End.Value; }

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
            existingEvent.EventDate = request.EventDate;
            existingEvent.CalendarId = request.CalendarId;
            existingEvent.StartTime = request.Start;
            if (request.End.HasValue) { existingEvent.EndTime = request.End.Value; }

            await _context.SaveChangesAsync();
            return Ok();
        }

    }
}
