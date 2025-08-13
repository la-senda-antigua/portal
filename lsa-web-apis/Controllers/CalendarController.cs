using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace lsa_web_apis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CalendarController : ControllerBase
    {
        private readonly VideoRecordingsDbContext _context;

        public CalendarController(VideoRecordingsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Route("upcomingEvents")]
        public async Task<ActionResult<IEnumerable<CalendarEvent>>> GetUpcomingEvents()
        {
            var events = await _context.CalendarEvents.ToListAsync();
            return Ok(events);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<CalendarEvent>> CreateEvent(CalendarEvent calendarEvent)
        {
            _context.CalendarEvents.Add(calendarEvent);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUpcomingEvents), new { id = calendarEvent.Id }, calendarEvent);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvent(int id, CalendarEvent calendarEvent)
        {
            if (id != calendarEvent.Id) { return BadRequest("Id does not match"); }

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
    }
}
