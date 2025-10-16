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
    public class LessonsController : ControllerBase
    {
        private readonly VideoRecordingsDbContext _context;
        private readonly IVideoRecordingService _videoRecordingService;
        private readonly IImageUploadService _imageUploadService;
        public LessonsController(VideoRecordingsDbContext context, IImageUploadService imageUploadService)
        {
            _context = context;
            _videoRecordingService = new VideoRecordingService(context);
            _imageUploadService = imageUploadService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<Lesson>>> GetLessons([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchTerm = "")
        {
            if (string.IsNullOrEmpty(searchTerm))
            {
                var pagedResult = await _context.Lessons.Include(l => l.Preacher).OrderByDescending(s => s.Id).ToPagedResultAsync(page, pageSize);
                return Ok(pagedResult);
            }

            var result = await _videoRecordingService.FilterVideosPaged<Lesson>(searchTerm, page, pageSize);
            return Ok(result);
        }

        [HttpGet("search")]
        public async Task<ActionResult<PagedResult<Sermon>>> SearchLessons([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Search query cannot be empty");

            var lessons = await _videoRecordingService.FilterVideosByQuery(query, VideoType.Lesson);
            if (lessons is null || !lessons.Any())
                return NotFound("No recordings found matching the search criteria");
            return Ok(lessons);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Lesson>> GetLesson(int id)
        {
            var lesson = await _context.Lessons.FindAsync(id);

            if (lesson is null)
                return NotFound();

            return Ok(lesson);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Lesson>> CreateLesson([FromForm] Lesson lesson, [FromForm] IFormFile coverImage)
        {
            _context.Lessons.Add(lesson);
            await _context.SaveChangesAsync();

            if (coverImage != null && coverImage.Length > 0)
            {
                var imageUrl = await _imageUploadService.UploadImageAsync(coverImage, lesson.Id, "lessons");
                lesson.Cover = imageUrl;
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetLesson), new { id = lesson.Id }, lesson);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLesson(int id, [FromForm] Lesson lesson, [FromForm] IFormFile? coverImage)
        {
            if (id != lesson.Id) return BadRequest("Id does not match");

            var existingLesson = await _context.Lessons.FindAsync(id);
            if (existingLesson is null) return NotFound();

            existingLesson.Title = lesson.Title;
            existingLesson.Date = lesson.Date;
            existingLesson.PreacherId = lesson.PreacherId;
            existingLesson.VideoPath = lesson.VideoPath;
            existingLesson.Playlist = lesson.Playlist;

            if (coverImage != null && coverImage.Length > 0)
            {
                var imageUrl = await _imageUploadService.UploadImageAsync(coverImage, id, "lessons");
                existingLesson.Cover = imageUrl;
            }

            _context.Lessons.Update(existingLesson);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLesson(int id)
        {
            var lesson = await _context.Lessons.FindAsync(id);
            if (lesson is null) return NotFound();

            _context.Lessons.Remove(lesson);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

}
