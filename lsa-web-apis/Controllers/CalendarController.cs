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
    public class CalendarController : ControllerBase
    {
        private readonly CalendarDbContext _context;

        public CalendarController(CalendarDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Route("GetEvents")]
        public async Task<ActionResult<IEnumerable<CalendarEventDto>>> GetEvents(DateTime? dateTime, bool includeCancelled = false)
        {
            var query = includeCancelled
                ? _context.CalendarEvents
                : _context.CalendarEvents.Where(s => !s.IsCancelled);

            if (dateTime is not null)
                query = query.Where(e => e.StartTime > dateTime);

            var result = await query.Select(e => new CalendarEventDto(e)).ToListAsync();
            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<CalendarEventDto>>> GetPage(DateTime? dateTime, bool includeCancelled = true, int page = 1, int pageSize = 10)
        {
            var query = includeCancelled
                ? _context.CalendarEvents.Where(s => !s.IsCancelled)
                : _context.CalendarEvents;

            if (dateTime is not null)
                query = query.Where(e => e.StartTime > dateTime);

            PagedResult<CalendarEventDto> result = await query.Select(e => new CalendarEventDto(e)).ToPagedResultAsync(page, pageSize);

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CalendarEvent>> GetEventById(int id)
        {
            var calendarEvent = await _context.CalendarEvents.FindAsync(id);
            if (calendarEvent is null) { return NotFound(); }
            return Ok(calendarEvent);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<CalendarEvent>> CreateEvent(CalendarEvent calendarEvent)
        {
            _context.CalendarEvents.Add(calendarEvent);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEvents), new { id = calendarEvent.Id }, calendarEvent);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvent(int id, CalendarEvent calendarEvent)
        {
            if (id != calendarEvent.Id) { return BadRequest("Id does not match"); }
            if (!ModelState.IsValid) { return BadRequest(ModelState); }

            var existingEvent = await _context.CalendarEvents.FindAsync(id);
            if (existingEvent is null) { return NotFound(); }

            existingEvent.Title = calendarEvent.Title;
            existingEvent.Description = calendarEvent.Description;
            existingEvent.StartTime = calendarEvent.StartTime;
            existingEvent.EndTime = calendarEvent.EndTime;

            _context.CalendarEvents.Update(existingEvent);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var existingEvent = await _context.CalendarEvents.FindAsync(id);
            if (existingEvent is null) { return NotFound(); }

            _context.CalendarEvents.Remove(existingEvent);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("cancelEvent/{id}")]
        public async Task<ActionResult> CancelEvent(int id)
        {
            var existingEvent = await _context.CalendarEvents.FindAsync(id);
            if (existingEvent is null) { return NotFound(); }

            existingEvent.IsCancelled = true;
            _context.CalendarEvents.Update(existingEvent);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("reactivateEvent/{id}")]
        public async Task<ActionResult> ReactivateEvent(int id)
        {
            var existingEvent = await _context.CalendarEvents.FindAsync(id);
            if (existingEvent is null) { return NotFound(); }
            existingEvent.IsCancelled = false;

            _context.CalendarEvents.Update(existingEvent);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
