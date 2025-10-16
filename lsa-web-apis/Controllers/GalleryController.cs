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
    public class GalleryController : ControllerBase
    {
        private readonly VideoRecordingsDbContext _context;
        private readonly IVideoRecordingService _videoRecordingService;
        private readonly IImageUploadService _imageUploadService;
        public GalleryController(VideoRecordingsDbContext context, IVideoRecordingService videoRecordingService, IImageUploadService imageUploadService)
        {
            _context = context;
            _videoRecordingService = videoRecordingService;
            _imageUploadService = imageUploadService;
        }

        [HttpGet]
        public async Task<ActionResult> GetGallery([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchTerm="")
        {
            if (string.IsNullOrEmpty(searchTerm))
            {
                var pagedResult = await _context.GalleryVideos.OrderByDescending(g => g.Date).ToPagedResultAsync(page, pageSize);
                return Ok(pagedResult);
            }

            var result = await _videoRecordingService.FilterVideosPaged<GalleryVideo>(searchTerm, page, pageSize);
            return Ok(result);
        }

        [HttpGet("GetAll")]
        public async Task<ActionResult> GetAllGalleryVideos()
        {
            var videos = await _context.GalleryVideos.OrderByDescending(v => v.Date).ToListAsync();
            return Ok(videos);
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
        public async Task<ActionResult<GalleryVideo>> CreateGallery([FromForm] GalleryVideo gallery, [FromForm] IFormFile coverImage)
        {
            _context.GalleryVideos.Add(gallery);
            await _context.SaveChangesAsync();

            if (coverImage != null && coverImage.Length > 0)
            {
                var imageUrl = await _imageUploadService.UploadImageAsync(coverImage, gallery.Id, "gallery");
                gallery.Cover = imageUrl;
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetGallery), new { id = gallery.Id }, gallery);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGallery(int id,[FromForm] GalleryVideo gallery,[FromForm] IFormFile? coverImage)
        {
            if (id != gallery.Id) return BadRequest("Id does not match");

            var existingGallery = await _context.GalleryVideos.FindAsync(id);
            if (existingGallery is null) return NotFound();

            existingGallery.Title = gallery.Title;            
            existingGallery.Date = gallery.Date;            
            existingGallery.VideoPath = gallery.VideoPath;
            existingGallery.Playlist = gallery.Playlist;

            if (coverImage != null && coverImage.Length > 0)
            {
                var imageUrl = await _imageUploadService.UploadImageAsync(coverImage, id, "gallery");
                existingGallery.Cover = imageUrl;
            }

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
