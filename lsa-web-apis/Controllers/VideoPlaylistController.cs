using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace lsa_web_apis.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class VideoPlaylistController : ControllerBase
    {
        private readonly VideoRecordingsDbContext _context;

        public VideoPlaylistController(VideoRecordingsDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VideoPlaylist>>> GetAll()
        {
            var playlists = await _context.Playlists.ToListAsync();
            return Ok(playlists);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<ActionResult<VideoPlaylist>> GetById(Guid id)
        {
            var playlist = await _context.Playlists.FindAsync(id);

            if (playlist == null)
                return NotFound();

            return Ok(playlist);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<VideoPlaylistController>> Create(VideoPlaylist playlist)
        {
            if (playlist == null || string.IsNullOrWhiteSpace(playlist.Name))
                return BadRequest("Playlist name cannot be empty");
            _context.Playlists.Add(playlist);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = playlist.Id }, playlist);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, VideoPlaylist playlist)
        {
            if (id != playlist.Id)
                return BadRequest("Playlist ID mismatch");

            var existingPlaylist = await _context.Playlists.FindAsync(id);
            if (existingPlaylist == null)
                return NotFound();

            existingPlaylist.Name = playlist.Name;
            _context.Playlists.Update(existingPlaylist);
            await _context.SaveChangesAsync();

            return Ok(existingPlaylist);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var playlist = await _context.Playlists.FindAsync(id);
            if (playlist == null)
                return NotFound();
            _context.Playlists.Remove(playlist);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
