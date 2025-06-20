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
    public class LessonsController : ControllerBase
    {
        private readonly SermonDbContext _context;
        public LessonsController(SermonDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<PagedResult<Lesson>>> GetLessons([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var pagedResult = await _context.Lessons.OrderByDescending(s => s.Id).ToPagedResultAsync(page, pageSize);
            return Ok(pagedResult);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Lesson>> GetLesson(int id)
        {
            var lesson = await _context.Lessons.FindAsync(id);

            if (lesson is null)
                return NotFound();

            return Ok(lesson);
        }

        [HttpPost]
        public async Task<ActionResult<Lesson>> CreateLesson(Lesson lesson)
        {
            _context.Lessons.Add(lesson);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLesson), new { id = lesson.Id }, lesson);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLesson(int id, Lesson lesson)
        {
            if (id != lesson.Id) return BadRequest("Id does not match");

            var existingLesson = await _context.Lessons.FindAsync(id);
            if (existingLesson is null) return NotFound();

            existingLesson.Title = lesson.Title;
            existingLesson.Cover = lesson.Cover;
            existingLesson.Date = lesson.Date;
            existingLesson.Preacher_Id = lesson.Preacher_Id;
            existingLesson.VideoPath = lesson.VideoPath;

            _context.Lessons.Update(existingLesson);
            await _context.SaveChangesAsync();

            return NoContent();
        }

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
