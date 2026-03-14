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
                        Role = u.Role
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
        public async Task<ActionResult<UserDto>> Register(UserDto data)
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
                    log.Warning("User registration failed. Username: {Username}", username);
                    return BadRequest("RegisterAsync returned null. User registration failed.");
                }

                List<CalendarMember> calendarsAsMember = new List<CalendarMember>();
                foreach (var calendarId in data.CalendarsAsMember)
                    calendarsAsMember.Add(new CalendarMember { CalendarId = calendarId, UserId = user.Id });

                context.CalendarMembers.AddRange(calendarsAsMember);

                List<CalendarManager> calendarsAsManager = new List<CalendarManager>();
                foreach (var calendarId in data.CalendarsAsManager)
                    calendarsAsManager.Add(new CalendarManager { CalendarId = calendarId, UserId = user.Id });

                context.CalendarManagers.AddRange(calendarsAsManager);

                List<UserGroupMember> userGroupMembers = [];
                foreach (var userGroupId in data.Groups)
                    userGroupMembers.Add(new UserGroupMember { UserGroupId = userGroupId, UserId = user.Id });

                context.UserGroupMembers.AddRange(userGroupMembers);

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                log.Info("User created successfully. UserId: {UserId}, Username: {Username}", user.Id, user.Username);
                var userDto = new UserDto
                {
                    UserId = user.Id,
                    Username = user.Username,
                    Name = user.Name,
                    LastName = user.LastName,
                    Role = user.Role,
                    Preferences = user.Preferences,
                    CalendarsAsManager = data.CalendarsAsManager,
                    CalendarsAsMember = data.CalendarsAsMember,
                    Groups = data.Groups
                };
                return Ok(userDto);
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
        public async Task<ActionResult<UserDto>> UpdateUser(Guid id, [FromBody] UserDto updateData)
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
                    .Select(calendarId => new CalendarManager { CalendarId = calendarId, UserId = id })
                    .ToList();

                var newCalendarsAsMember = updateData.CalendarsAsMember
                    .Select(calendarId => new CalendarMember { CalendarId = calendarId, UserId = id })
                    .ToList();

                var newUserGroups = updateData.Groups
                    .Select(userGroupId => new UserGroupMember { UserGroupId = userGroupId, UserId = id })
                    .ToList();

                context.CalendarManagers.AddRange(newCalendarsAsManager);
                context.CalendarMembers.AddRange(newCalendarsAsMember);
                context.UserGroupMembers.AddRange(newUserGroups);

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                log.Info("User updated successfully. UserId: {UserId}", id);
                var userDto = new UserDto
                {
                    UserId = user.Id,
                    Username = user.Username,
                    Name = user.Name,
                    LastName = user.LastName,
                    Role = user.Role,
                    Preferences = user.Preferences,
                    CalendarsAsManager = updateData.CalendarsAsManager,
                    CalendarsAsMember = updateData.CalendarsAsMember,
                    Groups = updateData.Groups
                };
                return Ok(userDto);
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
                var calendarsAsManager = await context.CalendarManagers.Where(cm => cm.UserId == id).ToListAsync();
                var calendarsAsMember = await context.CalendarMembers.Where(cm => cm.UserId == id).ToListAsync();
                var userGroups = await context.UserGroupMembers.Where(ugm => ugm.UserId == id).ToListAsync();
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
                        CalendarsAsManager = calendarsAsManager.Select(c => c.CalendarId).ToList(),
                        CalendarsAsMember = calendarsAsMember.Select(c => c.CalendarId).ToList(),
                        Groups = userGroups.Select(ug => ug.UserGroupId).ToList()
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
