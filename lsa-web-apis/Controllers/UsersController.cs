using lsa_web_apis.Data;
using lsa_web_apis.Models;
using lsa_web_apis.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using lsa_web_apis.Entities;

namespace lsa_web_apis.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController(IAuthService authService, UserDbContext context) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<UserDto>>> GetAllUsers()
        {
            var users = await context.PortalUsers
            .Select(
                u => new UserDto
                {
                    Username = u.Username,
                    Role = u.Role
                }
            ).ToListAsync();

            return Ok(users);
        }

        [HttpPost()]
        public async Task<ActionResult<User>> Register(UserDto data)
        {
            var username = data.Username;
            var role = data.Role;

            var user = await authService.RegisterAsync(username, role);
            if (user is null)
                return BadRequest("User name already in use.");

            return Ok(user);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<User>> UpdateUserRole(Guid id, [FromBody] string newRole)
        {
            var user = await context.PortalUsers.FindAsync(id);
            if (user is null)
                return NotFound("User not found.");

            user.Role = newRole;
            await context.SaveChangesAsync();

            return Ok(user);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await context.PortalUsers.FindAsync(id);
            if (user is null)
                return NotFound("User not found.");

            context.PortalUsers.Remove(user);
            await context.SaveChangesAsync();

            return NoContent();
        }


    }
}
