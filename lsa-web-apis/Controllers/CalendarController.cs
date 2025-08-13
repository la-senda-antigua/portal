using lsa_web_apis.Data;
using lsa_web_apis.Entities;
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
        public async Task<ActionResult<IEnumerable<CalendarEvent>>> GetEvents()
        {
            var events = await _context.CalendarEvents.ToListAsync();
            return Ok(events);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CalendarEvent>> GetEventById(int id)
        {
            var calendarEvent = await _context.CalendarEvents.FindAsync(id);
            if (calendarEvent is null) { return NotFound(); }
            return Ok(calendarEvent);
        }

        [HttpGet("upcoming")]
        public async Task<ActionResult<IEnumerable<CalendarEvent>>> GetUpcomingEvents()
        {
            var events = await _context.CalendarEvents
                .Where(e => e.StartingAt > DateTime.UtcNow)
                .ToListAsync();
            return Ok(events);
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
            existingEvent.StartingAt = calendarEvent.StartingAt;
            existingEvent.EndingAt = calendarEvent.EndingAt;
            existingEvent.Status = calendarEvent.Status;

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
    }
}
