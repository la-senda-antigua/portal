using lsa_web_apis.Data;
using lsa_web_apis.Models;
using lsa_web_apis.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using lsa_web_apis.Entities;
using lsa_web_apis.Extensions;

namespace lsa_web_apis.Controllers
{    
    [Route("[controller]")]
    [ApiController]
    public class UsersController(IAuthService authService, UserDbContext context, ILogger<UsersController> _logger) : ControllerBase
    {
        private RequestLogContext CreateLogContext(string actionName, Guid? transactionId = null) => RequestLoggingHelper.CreateContext<UsersController>(_logger, User, actionName, transactionId);

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PagedResult<UserDto>>> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchTerm = "")
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(GetUsers), transactionId);

            try
            {
                log.Info("Getting users. Page: {Page}, PageSize: {PageSize}, SearchTerm: {SearchTerm}", page, pageSize, searchTerm);

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
                            }).ToList(),
                        UserGroups = context.UserGroups
                            .Where(ug => ug.Members.Any(m => m.UserId == u.Id))
                            .Select(ug => new UserGroupDto
                            {
                                Id = ug.Id,
                                GroupName = ug.GroupName,
                            }).ToList()
                    });

                var result = await usersQuery
                    .AsSplitQuery()
                    .ToPagedResultAsync(page, pageSize);

                log.Debug("Returning paged users. Count: {Count}, TotalCount: {TotalCount}", result.Items.Count(), result.TotalItems);
                return Ok(result);
            }
            catch (Exception ex)
            {
                log.Error(ex, "Error while getting users.");
                return StatusCode(500, "An error occurred while getting users.");
            }
        }

        [HttpGet("GetAll")]
        [Authorize(Roles = "Admin,CalendarManager")]
        public async Task<ActionResult<PagedResult<UserDto>>> GetAllUsers()
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(GetAllUsers), transactionId);

            try
            {
                log.Info("Getting all users.");
                var users = await context.PortalUsers.Select(u => new UserDto
                {
                    UserId = u.Id,
                    Username = u.Username,
                    Name = u.Name,
                    LastName = u.LastName,
                    Role = u.Role
                }).ToListAsync();

                log.Debug("Returning {Count} users.", users.Count);
                return Ok(users);
            }
            catch (Exception ex)
            {
                log.Error(ex, "Error while getting all users.");
                return StatusCode(500, "An error occurred while getting users.");
            }
        }

        [HttpPost()]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<User>> Register(UserDto data)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(Register), transactionId);
            log.InfoJson("Registering user. Values:", data);

            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var username = data.Username;
                var role = data.Role;

                var user = await authService.RegisterAsync(username, role, data.Name!, data.LastName!);
                if (user is null)
                {
                    log.Warning("Register failed because username is already in use. Username: {Username}", username);
                    return BadRequest("User name already in use.");
                }

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

                log.Info("User created successfully. UserId: {UserId}, Username: {Username}", user.Id, user.Username);
                return Ok(user);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                log.ErrorJson(ex, "Error while creating user. Values:", data);
                return StatusCode(500, "An error occurred while creating the user.");
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,CalendarManager")]
        public async Task<ActionResult<User>> UpdateUser(Guid id, [FromBody] UserDto updateData)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(UpdateUser), transactionId);
            log.Info("Updating user with ID: {UserId}", id);
            log.InfoJson("New values for user:", updateData);

            using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                var user = await context.PortalUsers.FindAsync(id);
                if (user is null)
                {
                    log.Warning("User not found. UserId: {UserId}", id);
                    return NotFound("User not found.");
                }

                user.Username = updateData.Username;
                user.Role = updateData.Role;
                user.Name = updateData.Name;
                user.LastName = updateData.LastName;
                user.Preferences = updateData.Preferences;

                var existingCalendarsAsManager = await context.CalendarManagers.Where(cm => cm.UserId == id).ToListAsync();
                var existingCalendarsAsMember = await context.CalendarMembers.Where(cm => cm.UserId == id).ToListAsync();
                var existingUserGroups = await context.UserGroupMembers.Where(ugm => ugm.UserId == id).ToListAsync();
                context.CalendarManagers.RemoveRange(existingCalendarsAsManager);
                context.CalendarMembers.RemoveRange(existingCalendarsAsMember);
                context.UserGroupMembers.RemoveRange(existingUserGroups);

                var newCalendarsAsManager = updateData.CalendarsAsManager
                    .Select(calendar => new CalendarManager { CalendarId = calendar.Id, UserId = id })
                    .ToList();

                var newCalendarsAsMember = updateData.CalendarsAsMember
                    .Select(calendar => new CalendarMember { CalendarId = calendar.Id, UserId = id })
                    .ToList();
                
                var newUserGroupMembers = updateData.UserGroups
                    .Select(ug => new UserGroupMember { UserGroupId = ug.Id!.Value, UserId = id })
                    .ToList();

                context.CalendarManagers.AddRange(newCalendarsAsManager);
                context.CalendarMembers.AddRange(newCalendarsAsMember);
                context.UserGroupMembers.AddRange(newUserGroupMembers);
                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                log.Info("User updated successfully. UserId: {UserId}", id);
                return Ok(user);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                log.ErrorJson(ex, "Error while updating user. Values:", updateData);
                return StatusCode(500, "An error occurred while updating the user.");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(DeleteUser), transactionId);

            try
            {
                log.Info("Deleting user with ID: {UserId}", id);
                var user = await context.PortalUsers.FindAsync(id);
                if (user is null)
                {
                    log.Warning("User not found. UserId: {UserId}", id);
                    return NotFound("User not found.");
                }

                context.PortalUsers.Remove(user);
                await context.SaveChangesAsync();

                log.Info("User deleted successfully. UserId: {UserId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                log.Error(ex, "Error while deleting user with ID: {UserId}", id);
                return StatusCode(500, "An error occurred while deleting the user.");
            }
        }
    
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,CalendarManager")]
        public async Task<ActionResult<UserDto>> GetUserById(Guid id)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(GetUserById), transactionId);

            try
            {
                log.Info("Getting user by ID: {UserId}", id);
                var user = await context.PortalUsers
                    .AsNoTracking()
                    .Where(u => u.Id == id)
                    .Select(u => new UserDto
                    {
                        UserId = u.Id,
                        Username = u.Username,
                        Name = u.Name,
                        LastName = u.LastName,
                        Role = u.Role,
                        Preferences = u.Preferences,
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
                            }).ToList(),
                        UserGroups = context.UserGroups
                            .Where(ug => ug.Members.Any(m => m.UserId == u.Id))
                            .Select(ug => new UserGroupDto
                            {
                                Id = ug.Id,
                                GroupName = ug.GroupName,
                            }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (user is null)
                {
                    log.Warning("User not found. UserId: {UserId}", id);
                    return NotFound("User not found.");
                }

                log.Debug("Returning user by ID. UserId: {UserId}", id);
                return Ok(user);
            }
            catch (Exception ex)
            {
                log.Error(ex, "Error while getting user by ID: {UserId}", id);
                return StatusCode(500, "An error occurred while getting the user.");
            }
        }
    }
}
