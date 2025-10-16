using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Extensions;
using lsa_web_apis.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace lsa_web_apis.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class PreachersController : ControllerBase
    {
        private readonly VideoRecordingsDbContext _context;
        public PreachersController(VideoRecordingsDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<PagedResult<Preacher>>> GetPreachers([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchTerm = "")
        {
            if (string.IsNullOrEmpty(searchTerm))
            {
                var pagedResult = await _context.Preachers
                .OrderBy(p => p.Id)
                .ToPagedResultAsync(page, pageSize);

                return Ok(pagedResult);
            }

            var result = await _context.Preachers
                .Where(p => !string.IsNullOrEmpty(p.Name) && EF.Functions.Like(p.Name, $"%{searchTerm}%"))
                .ToPagedResultAsync(page, pageSize);
                
            return Ok(result);

        }

        [HttpGet("GetAll")]
        public async Task<ActionResult<PagedResult<Preacher>>> GetAllPreachers()
        {

            var pagedResult = await _context.Preachers
            .OrderBy(p => p.Name).ToArrayAsync();

            return Ok(pagedResult);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Preacher>> GetPreacher(int id)
        {
            var preacher = await _context.Preachers.FindAsync(id);

            if (preacher is null)
                return NotFound();

            return Ok(preacher);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Preacher>> CreatePreacher(Preacher preacher)
        {
            _context.Preachers.Add(preacher);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPreacher), new { id = preacher.Id }, preacher);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePreacher(int id, Preacher preacher)
        {
            if (id != preacher.Id)
                return BadRequest("Id does not match");

            var existingPreacher = await _context.Preachers.FindAsync(id);
            if (existingPreacher is null)
                return NotFound();

            existingPreacher.Name = preacher.Name;

            _context.Preachers.Update(existingPreacher);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePreacher(int id)
        {
            var preacher = await _context.Preachers.FindAsync(id);
            if (preacher is null)
                return NotFound();

            _context.Preachers.Remove(preacher);
            await _context.SaveChangesAsync();

            return NoContent();
        }


    }
}
