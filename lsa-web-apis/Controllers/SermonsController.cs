using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Extensions;
using lsa_web_apis.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace lsa_web_apis.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SermonsController : ControllerBase
    {
        private readonly SermonDbContext _context;
        public SermonsController(SermonDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<PagedResult<Sermon>>> GetSermons([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var pagedResult = await _context.Sermons.OrderByDescending(s => s.Id).ToPagedResultAsync(page, pageSize);
            return Ok(pagedResult);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Sermon>> GetSermon(int id)
        {
            var sermon = await _context.Sermons.FindAsync(id);

            if (sermon is null)
                return NotFound();

            return Ok(sermon);
        }

        [HttpPost]
        public async Task<ActionResult<Sermon>> CreateSermon(Sermon sermon)
        {
            _context.Sermons.Add(sermon);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSermon), new { id = sermon.Id }, sermon);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSermon(int id, Sermon sermon)
        {
            if (id != sermon.Id) return BadRequest("Id does not match");

            var existingSermon = await _context.Sermons.FindAsync(id);
            if (existingSermon is null) return NotFound();

            existingSermon.Title = sermon.Title;
            existingSermon.AudioPath = sermon.AudioPath;
            existingSermon.Cover = sermon.Cover;
            existingSermon.Date = sermon.Date;
            existingSermon.Preacher_Id = sermon.Preacher_Id;
            existingSermon.VideoPath = sermon.VideoPath;

            _context.Sermons.Update(existingSermon);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSermon(int id)
        {
            var sermon = await _context.Sermons.FindAsync(id);
            if (sermon is null) return NotFound();

            _context.Sermons.Remove(sermon);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
