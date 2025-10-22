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
    public class PublicEventsController : ControllerBase
    {
        private readonly PublicEventsDbContext _context;

        public PublicEventsController(PublicEventsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Route("GetEvents")]
        public async Task<ActionResult<IEnumerable<PublicEventDto>>> GetEvents(DateTime? dateTime, bool includeCancelled = false)
        {
            var query = includeCancelled
                ? _context.PublicEvents
                : _context.PublicEvents.Where(s => !s.IsCancelled);

            if (dateTime is null)
                dateTime = DateTime.Now;

            query = query.Where(e => e.StartTime > dateTime);

            var result = await query.OrderBy(e=> e.StartTime).Select(e => new PublicEventDto(e)).ToListAsync();
            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<PublicEventDto>>> GetPage(DateTime? dateTime, bool includeCancelled = true, int page = 1, int pageSize = 10)
        {
            var query = !includeCancelled
                ? _context.PublicEvents.Where(s => !s.IsCancelled)
                : _context.PublicEvents;

            if (dateTime is not null)
                query = query.Where(e => e.StartTime > dateTime);

            PagedResult<PublicEventDto> result = await query.OrderBy(e=> e.StartTime).Select(e => new PublicEventDto(e)).ToPagedResultAsync(page, pageSize);

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PublicEvent>> GetEventById(int id)
        {
            var publicEvent = await _context.PublicEvents.FindAsync(id);
            if (publicEvent is null) { return NotFound(); }
            return Ok(publicEvent);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<PublicEvent>> CreateEvent(PublicEvent publicEvent)
        {
            _context.PublicEvents.Add(publicEvent);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEvents), new { id = publicEvent.Id }, publicEvent);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvent(int id, PublicEvent publicEvent)
        {
            if (id != publicEvent.Id) { return BadRequest("Id does not match"); }
            if (!ModelState.IsValid) { return BadRequest(ModelState); }

            var existingEvent = await _context.PublicEvents.FindAsync(id);
            if (existingEvent is null) { return NotFound(); }

            existingEvent.Title = publicEvent.Title;
            existingEvent.Description = publicEvent.Description;
            existingEvent.StartTime = publicEvent.StartTime;
            existingEvent.EndTime = publicEvent.EndTime;

            _context.PublicEvents.Update(existingEvent);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var existingEvent = await _context.PublicEvents.FindAsync(id);
            if (existingEvent is null) { return NotFound(); }

            _context.PublicEvents.Remove(existingEvent);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("cancelEvent/{id}")]
        public async Task<ActionResult> CancelEvent(int id)
        {
            var existingEvent = await _context.PublicEvents.FindAsync(id);
            if (existingEvent is null) { return NotFound(); }

            existingEvent.IsCancelled = true;
            _context.PublicEvents.Update(existingEvent);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("reactivateEvent/{id}")]
        public async Task<ActionResult> ReactivateEvent(int id)
        {
            var existingEvent = await _context.PublicEvents.FindAsync(id);
            if (existingEvent is null) { return NotFound(); }
            existingEvent.IsCancelled = false;

            _context.PublicEvents.Update(existingEvent);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
