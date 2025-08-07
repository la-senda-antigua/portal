using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Extensions;
using lsa_web_apis.Models;
using lsa_web_apis.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace lsa_web_apis.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class SermonsController : ControllerBase
    {
        private readonly VideoRecordingsDbContext _context;
        private readonly IVideoRecordingService _videoRecordingService;
        public SermonsController(VideoRecordingsDbContext context, IVideoRecordingService videoRecordingService)
        {
            _context = context;
            _videoRecordingService = videoRecordingService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<Sermon>>> GetSermons([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var pagedResult = await _context.Sermons.Include(s => s.Preacher).OrderByDescending(s => s.Id).ToPagedResultAsync(page, pageSize);
            return Ok(pagedResult);
        }

        [HttpGet("search")]
        public async Task<ActionResult<PagedResult<Sermon>>> SearchSermons([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Search query cannot be empty");

            var sermons = await _videoRecordingService.FilterVideosByQuery(query, VideoType.Sermon);
            if (sermons is null || !sermons.Any())
                return NotFound("No sermons found matching the search criteria");
            return Ok(sermons);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Sermon>> GetSermon(int id)
        {
            var sermon = await _context.Sermons.FindAsync(id);

            if (sermon is null)
                return NotFound();

            return Ok(sermon);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Sermon>> CreateSermon(Sermon sermon)
        {
            _context.Sermons.Add(sermon);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSermon), new { id = sermon.Id }, sermon);
        }

        [Authorize(Roles = "Admin")]
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
            existingSermon.PreacherId = sermon.PreacherId;
            existingSermon.VideoPath = sermon.VideoPath;

            _context.Sermons.Update(existingSermon);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
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
