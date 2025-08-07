using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Extensions;
using lsa_web_apis.Models;
using lsa_web_apis.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace lsa_web_apis.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class GalleryController : ControllerBase
    {
        private readonly VideoRecordingsDbContext _context;
        private readonly IVideoRecordingService _videoRecordingService;
        public GalleryController(VideoRecordingsDbContext context, IVideoRecordingService videoRecordingService)
        {
            _context = context;
            _videoRecordingService = videoRecordingService;
        }

        [HttpGet]
        public async Task<ActionResult> GetGallery([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var pagedResult = await _context.GalleryVideos.OrderByDescending(g => g.Date).ToPagedResultAsync(page, pageSize);
            return Ok(pagedResult);
        }

        [HttpGet("search")]
        public async Task<ActionResult<PagedResult<GalleryVideo>>> Search([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Search query cannot be empty");

            var items = await _videoRecordingService.FilterVideosByQuery(query, VideoType.Gallery);
            if (items is null || !items.Any())
                return NotFound("No gallery items found matching the search criteria");
            return Ok(items);
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<GalleryVideo>> GetGallery(int id)
        {
            var gallery = await _context.GalleryVideos.FindAsync(id);

            if (gallery is null)
                return NotFound();

            return Ok(gallery);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<GalleryVideo>> CreateGallery(GalleryVideo gallery)
        {
            _context.GalleryVideos.Add(gallery);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGallery), new { id = gallery.Id }, gallery);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGallery(int id, GalleryVideo gallery)
        {
            if (id != gallery.Id) return BadRequest("Id does not match");

            var existingGallery = await _context.GalleryVideos.FindAsync(id);
            if (existingGallery is null) return NotFound();

            existingGallery.Title = gallery.Title;            
            existingGallery.Cover = gallery.Cover;
            existingGallery.Date = gallery.Date;            
            existingGallery.VideoPath = gallery.VideoPath;

            _context.GalleryVideos.Update(existingGallery);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGallery(int id)
        {
            var gallery = await _context.GalleryVideos.FindAsync(id);
            if (gallery is null) return NotFound();

            _context.GalleryVideos.Remove(gallery);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
