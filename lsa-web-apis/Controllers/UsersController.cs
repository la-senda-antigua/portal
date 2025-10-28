using lsa_web_apis.Data;
using lsa_web_apis.Models;
using lsa_web_apis.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using lsa_web_apis.Entities;
using lsa_web_apis.Extensions;

namespace lsa_web_apis.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("[controller]")]
    [ApiController]
    public class UsersController(IAuthService authService, UserDbContext context) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<PagedResult<UserDto>>> GetAllUsers([FromQuery] int page = 1,[FromQuery] int pageSize = 10,[FromQuery] string searchTerm = "")
        {            
            var usersQuery = context.PortalUsers
                .Where(u => string.IsNullOrEmpty(searchTerm) ||
                           u.Username.Contains(searchTerm) ||
                           u.Role.Contains(searchTerm));

            var pagedUsers = await usersQuery.ToPagedResultAsync(page, pageSize);
            
            var userDtos = new List<UserDto>();
            foreach (var user in pagedUsers.Items)
            {
                // calendars as manager
                var managerCalendars = await context.CalendarManagers
                    .Where(cm => cm.UserId == user.Id)
                    .Select(cm => new CalendarDto
                    {
                        Name = cm.Calendar.Name,
                        Active = cm.Calendar.Active
                    })
                    .ToListAsync();

                // calendars as member
                var memberCalendars = await context.CalendarMembers
                    .Where(cm => cm.UserId == user.Id)
                    .Select(cm => new CalendarDto
                    {
                        Name = cm.Calendar.Name,
                        Active = cm.Calendar.Active
                    })
                    .ToListAsync();

                userDtos.Add(new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Role = user.Role,
                    CalendarsAsManager = managerCalendars,
                    CalendarsAsMember = memberCalendars
                });
            }

            var result = new PagedResult<UserDto>
            {
                Items = userDtos,
                Page = pagedUsers.Page,
                PageSize = pagedUsers.PageSize,
                TotalItems = pagedUsers.TotalItems
            };

            return Ok(result);
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
