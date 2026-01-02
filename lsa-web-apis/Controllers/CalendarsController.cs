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
        public async Task<ActionResult<PagedResult<CalendarEventDto>>> GetMonthEvents(int month, int year)
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
                .AsNoTracking()
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("dateEvents/{date}")]
        [Authorize]
        public async Task<ActionResult<List<dynamic>>> GetDateEvents(string date)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            List<Guid> myCalendarIds = new();

            if (User.IsInRole("Admin"))
            {
                myCalendarIds = await _context.Calendars.Where(c=> c.Active == true).Select(c => c.Id).ToListAsync();
            } else {
                myCalendarIds = await _context.CalendarMembers
                .Where(m => m.UserId == userId)
                .Select(m => m.CalendarId)
                .Union(_context.CalendarManagers.Where(m => m.UserId == userId).Select(m => m.CalendarId))
                .ToListAsync();                
            }

            var targetDate = DateTime.Parse(date);
            var dayStart = $"{date} 00:00:00";
            var dayEnd = $"{date} 23:59:59";

            var rawEvents = await _context.CalendarEvents
            .Where(
                e => 
                e.StartTime != null 
                && myCalendarIds.Contains(e.CalendarId)
                && (
                    (e.EndTime == null && EF.Functions.Like(e.StartTime, $"{date}%")) ||
                    (e.EndTime != null && e.StartTime.CompareTo(dayEnd) <= 0 && e.EndTime.CompareTo(dayStart) >= 0)
                )
            )
            .ToListAsync();

            var events = rawEvents.Select(e => 
            {
                int currentDay = 1;
                int totalDays = 1;

                if (!string.IsNullOrEmpty(e.EndTime) && DateTime.TryParse(e.StartTime, out var start) && DateTime.TryParse(e.EndTime, out var end))
                {
                    totalDays = (int)(end.Date - start.Date).TotalDays + 1;
                    currentDay = (int)(targetDate.Date - start.Date).TotalDays + 1;
                }

                return new 
                {
                    e.Id,
                    e.Title,
                    e.Description,
                    e.CalendarId,
                    Start = e.StartTime,
                    End = e.EndTime,
                    e.AllDay,
                    CurrentDay = currentDay,
                    TotalDays = totalDays
                };
            })
            .OrderBy(e => e.Start)
            .ToList();

            var continuesToNextDay = events.Any(e => e.TotalDays > 1 && e.CurrentDay < e.TotalDays);
            var startedOnPreviousDay = events.Any(e => e.TotalDays > 1 && e.CurrentDay > 1);

            string nextDate;
            string previousDate;

            if (continuesToNextDay)
            {
                nextDate = targetDate.AddDays(1).ToString("yyyy-MM-dd");
            }
            else
            {
                var nextEvent = await _context.CalendarEvents
                    .Where(e => e.StartTime != null 
                        && e.StartTime.CompareTo(dayEnd) > 0 
                        && myCalendarIds.Contains(e.CalendarId))
                    .OrderBy(e => e.StartTime)
                    .Select(e => e.StartTime)
                    .FirstOrDefaultAsync();
                nextDate = nextEvent != null ? nextEvent.Substring(0, 10) : "";
            }

            if (startedOnPreviousDay)
            {
                previousDate = targetDate.AddDays(-1).ToString("yyyy-MM-dd");
            }
            else
            {
                var lastEventStart = await _context.CalendarEvents
                    .Where(e => e.StartTime != null && e.StartTime.CompareTo(date) < 0 && myCalendarIds.Contains(e.CalendarId))
                    .OrderByDescending(e => e.StartTime)
                    .Select(e => e.StartTime)
                    .FirstOrDefaultAsync();

                var lastEventEnd = await _context.CalendarEvents
                    .Where(e => e.EndTime != null && e.EndTime.CompareTo(date) < 0 && myCalendarIds.Contains(e.CalendarId))
                    .OrderByDescending(e => e.EndTime)
                    .Select(e => e.EndTime)
                    .FirstOrDefaultAsync();

                string? previousEventDate;
                if (lastEventStart != null && lastEventEnd != null)
                {
                    previousEventDate = string.Compare(lastEventStart, lastEventEnd) > 0 ? lastEventStart : lastEventEnd;
                }
                else
                {
                    previousEventDate = lastEventStart ?? lastEventEnd;
                }
                
                previousDate = previousEventDate != null ? previousEventDate.Substring(0, 10) : "";
            }

            return Ok(new
            {
                events,
                previousDate,
                nextDate
            });
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
            if (!string.IsNullOrEmpty(request.End)) { 
                existingEvent.EndTime = request.End.Replace("T", " ");
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

    }
}
