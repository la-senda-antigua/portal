using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace lsa_web_apis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CalendarsController(UserDbContext _context) : ControllerBase
    {
        [Authorize(Roles = "Admin,CalendarManager")]
        [HttpGet]
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

        [HttpGet("user/{userId}")]
        [Authorize(Roles = "Admin,CalendarManager")]
        public async Task<ActionResult<List<Calendar>>> GetByUserId(Guid userId)
        {
            var calendars = await _context.Calendars
            .Where(c => c.Managers.Any(m => m.UserId == userId)
                     || c.Members.Any(m => m.UserId == userId))
            .ToListAsync();

            return Ok(calendars);

        }

    }
}
