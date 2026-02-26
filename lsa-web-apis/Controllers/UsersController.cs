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
    [Route("[controller]")]
    [ApiController]
    public class UsersController(IAuthService authService, UserDbContext context) : ControllerBase
    {
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PagedResult<UserDto>>> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchTerm = "")
        {
            var usersQuery = context.PortalUsers
                .AsNoTracking()
                .Where(u => string.IsNullOrEmpty(searchTerm) ||
                           u.Username.Contains(searchTerm) ||
                           u.Name!.Contains(searchTerm) ||
                           u.LastName!.Contains(searchTerm) ||
                           u.Role.Contains(searchTerm))
                .OrderByDescending(u => u.RowId)
                .Select(u => new UserDto
                {
                    RowId = u.RowId,
                    UserId = u.Id,
                    Username = u.Username,
                    Name = u.Name,
                    LastName = u.LastName,
                    Role = u.Role,
                    CalendarsAsManager = context.CalendarManagers
                        .Where(cm => cm.UserId == u.Id)
                        .Select(cm => new CalendarDto
                        {
                            Id = cm.Calendar.Id,
                            Name = cm.Calendar.Name,
                            Active = cm.Calendar.Active
                        }).ToList(),
                    CalendarsAsMember = context.CalendarMembers
                        .Where(cm => cm.UserId == u.Id)
                        .Select(cm => new CalendarDto
                        {
                            Id = cm.Calendar.Id,
                            Name = cm.Calendar.Name,
                            Active = cm.Calendar.Active
                        }).ToList()
                });

            var result = await usersQuery
                .AsSplitQuery()
                .ToPagedResultAsync(page, pageSize);

            return Ok(result);
        }

        [HttpGet("GetAll")]
        [Authorize(Roles = "Admin,CalendarManager")]
        public async Task<ActionResult<PagedResult<UserDto>>> GetAllUsers()
        {
            var users = await context.PortalUsers.Select(u => new UserDto
            {
                UserId = u.Id,
                Username = u.Username,
                Name = u.Name,
                LastName= u.LastName,
                Role = u.Role
            }).ToListAsync();

            return Ok(users);
        }

        [HttpPost()]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<User>> Register(UserDto data)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var username = data.Username;
                var role = data.Role;

                var user = await authService.RegisterAsync(username, role, data.Name!, data.LastName!);
                if (user is null)
                    return BadRequest("User name already in use.");

                List<CalendarMember> calendarsAsMember = new List<CalendarMember>();
                foreach (var item in data.CalendarsAsMember)
                    calendarsAsMember.Add(new CalendarMember { CalendarId = item.Id, UserId = user.Id });

                context.CalendarMembers.AddRange(calendarsAsMember);

                List<CalendarManager> calendarsAsManager = new List<CalendarManager>();
                foreach (var item in data.CalendarsAsManager)
                    calendarsAsManager.Add(new CalendarManager { CalendarId = item.Id, UserId = user.Id });

                context.CalendarManagers.AddRange(calendarsAsManager);
                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(user);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred while creating the user. {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<User>> UpdateUser(Guid id, [FromBody] UserDto updateData)
        {
            using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                var user = await context.PortalUsers.FindAsync(id);
                if (user is null) return NotFound("User not found.");

                user.Username = updateData.Username;
                user.Role = updateData.Role;
                user.Name = updateData.Name;
                user.LastName = updateData.LastName;


                var existingCalendarsAsManager = await context.CalendarManagers.Where(cm => cm.UserId == id).ToListAsync();
                var existingCalendarsAsMember = await context.CalendarMembers.Where(cm => cm.UserId == id).ToListAsync();
                context.CalendarManagers.RemoveRange(existingCalendarsAsManager);
                context.CalendarMembers.RemoveRange(existingCalendarsAsMember);

                var newCalendarsAsManager = updateData.CalendarsAsManager
                    .Select(calendar => new CalendarManager { CalendarId = calendar.Id, UserId = id })
                    .ToList();

                var newCalendarsAsMember = updateData.CalendarsAsMember
                    .Select(calendar => new CalendarMember { CalendarId = calendar.Id, UserId = id })
                    .ToList();

                context.CalendarManagers.AddRange(newCalendarsAsManager);
                context.CalendarMembers.AddRange(newCalendarsAsMember);

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(user);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred while updating the user. {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
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
