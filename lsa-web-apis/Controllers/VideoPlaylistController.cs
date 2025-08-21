using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Extensions;
using lsa_web_apis.Models;
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

        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<VideoPlaylist>>> GetAll()
        {
            var playlists = await _context.Playlists.ToListAsync();
            return Ok(playlists);
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<VideoPlaylist>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {

            var pagedResult = await _context.Playlists
            .OrderBy(p => p.Id)
            .ToPagedResultAsync(page, pageSize);

            return Ok(pagedResult);
        }

        [HttpGet("SermonPlaylists")]
        public async Task<ActionResult<IEnumerable<HydratedVideoPlaylist>>> GetSermonPlaylists()
        {
            var playlists = await _context.Playlists.ToListAsync();
            var sermons = await _context.Sermons.Where(s => s.Playlist != null && s.Playlist != Guid.Empty).ToListAsync();
            var hydratedPlaylists = playlists.Where(pl => sermons.Any(s => s.Playlist == pl.Id)).Select(p => new HydratedVideoPlaylist
            {
                Id = p.Id,
                Name = p.Name,
                VideoIds = [.. sermons.Where(s => s.Playlist == p.Id).Select(s => s.Id)]
            }).ToList();
            return Ok(hydratedPlaylists);
        }

        [HttpGet("LessonPlaylists")]
        public async Task<ActionResult<IEnumerable<HydratedVideoPlaylist>>> GetLessonPlaylists()
        {
            var playlists = await _context.Playlists.ToListAsync();
            var lessons = await _context.Lessons
            .Where(l => l.Playlist != null && l.Playlist != Guid.Empty)
            .ToListAsync();

            var hydratedPlaylists = playlists
            .Where(p => lessons.Any(l => l.Playlist == p.Id))
            .Select(p => new HydratedVideoPlaylist
            {
                Id = p.Id,
                Name = p.Name,
                VideoIds = lessons.Where(l => l.Playlist == p.Id).Select(l => l.Id).ToList()
            })
            .ToList();

            return Ok(hydratedPlaylists);
        }

        [HttpGet("GalleryPlaylists")]
        public async Task<ActionResult<IEnumerable<HydratedVideoPlaylist>>> GetGalleryPlaylists()
        {
            var playlists = await _context.Playlists.ToListAsync();
            var galleries = await _context.GalleryVideos.Where(g => g.Playlist != null && g.Playlist != Guid.Empty).ToListAsync();
            var hydratedPlaylists = playlists.Where(pl => galleries.Any(gl => gl.Playlist == pl.Id)).Select(p => new HydratedVideoPlaylist
            {
                Id = p.Id,
                Name = p.Name,
                VideoIds = [.. galleries.Where(g => g.Playlist == p.Id).Select(g => g.Id)]
            }).ToList();
            return Ok(hydratedPlaylists);
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
