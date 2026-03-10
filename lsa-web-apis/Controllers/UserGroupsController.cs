using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Extensions;
using lsa_web_apis.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace lsa_web_apis.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class UserGroupsController(UserDbContext _context, ILogger<UserGroupsController> _logger) : ControllerBase
    {
        private RequestLogContext CreateLogContext(string actionName, Guid? transactionId = null) => RequestLoggingHelper.CreateContext<UserGroupsController>(_logger, User, actionName, transactionId);

        [Authorize(Roles = "Admin,CalendarManager")]
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<UserGroupDto>>> Get()
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(Get), transactionId);

            try
            {
                log.Info("Getting all user groups.");
                var groups = await _context.UserGroups
                    .Include(ug => ug.Members)
                    .ThenInclude(m => m.User)
                    .Select(ug => new UserGroupDto
                    {
                        Id = ug.Id,
                        GroupName = ug.GroupName,
                        Members = ug.Members.Select(m => new CalendarMemberDto
                        {
                            UserId = m.UserId,
                            Username = m.User.Username,
                            Name = m.User.Name ?? "",
                            LastName = m.User.LastName ?? ""
                        }).ToList()
                    })
                    .ToListAsync();

                log.Debug("Returning {Count} user groups.", groups.Count);
                return Ok(groups);
            }
            catch (Exception ex)
            {
                log.Error(ex, "Error while getting user groups.");
                return StatusCode(500, "An error occurred while getting user groups.");
            }
        }

        [Authorize(Roles = "Admin,CalendarManager")]
        [HttpGet("{id}")]
        public async Task<ActionResult<UserGroupDto>> Get(Guid id)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(Get), transactionId);

            try
            {
                log.Info("Getting user group with ID: {UserGroupId}", id);
                var group = await _context.UserGroups
                    .Include(ug => ug.Members)
                    .ThenInclude(m => m.User)
                    .Where(ug => ug.Id == id)
                    .Select(ug => new UserGroupDto
                    {
                        Id = ug.Id,
                        GroupName = ug.GroupName,
                        Members = ug.Members.Select(m => new CalendarMemberDto
                        {
                            UserId = m.UserId,
                            Username = m.User.Username,
                            Name = m.User.Name ?? "",
                            LastName = m.User.LastName
                        }).ToList()
                    }).FirstOrDefaultAsync();

                if (group == null)
                {
                    log.Warning("User group not found. UserGroupId: {UserGroupId}", id);
                    return NotFound("Group not found");
                }

                log.Debug("User group found. UserGroupId: {UserGroupId}, MembersCount: {MembersCount}", id, group.Members?.Count ?? 0);
                return Ok(group);
            }
            catch (Exception ex)
            {
                log.Error(ex, "Error while getting user group with ID: {UserGroupId}", id);
                return StatusCode(500, "An error occurred while getting the user group.");
            }
        }

        [Authorize(Roles = "Admin,CalendarManager")]
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] UserGroupDto dto)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(Create), transactionId);

            try
            {
                log.InfoJson("Creating user group. Values:", dto);
                _context.UserGroups.Add(new UserGroup { GroupName = dto.GroupName, Active = true });
                await _context.SaveChangesAsync();
                log.Info("User group created successfully. GroupName: {GroupName}", dto.GroupName);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                log.ErrorJson(ex, "Error while creating user group. Values:", dto);
                return StatusCode(500, "An error occurred while creating the user group.");
            }
        }

        [Authorize(Roles = "Admin,CalendarManager")]
        [HttpPut("{userGroupId}")]
        public async Task<ActionResult> UpdateUserGroup(Guid userGroupId, [FromBody] UserGroupDto dto)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(UpdateUserGroup), transactionId);

            try
            {
                log.Info("Updating user group with ID: {UserGroupId}", userGroupId);
                log.InfoJson("New values for user group:", dto);
                var userGroup = await _context.UserGroups.FindAsync(userGroupId);
                if (userGroup is null)
                {
                    log.Warning("User group not found. UserGroupId: {UserGroupId}", userGroupId);
                    return NotFound("Group not found");
                }

                userGroup.GroupName = dto.GroupName;

                await _context.SaveChangesAsync();
                log.Info("User group updated successfully. UserGroupId: {UserGroupId}", userGroupId);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                log.ErrorJson(ex, "Error while updating user group. Values:", dto);
                return StatusCode(500, "An error occurred while updating the user group.");
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{userGroupId}")]
        public async Task<ActionResult> DeleteUserGroup(Guid userGroupId)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(DeleteUserGroup), transactionId);

            try
            {
                log.Info("Deleting user group with ID: {UserGroupId}", userGroupId);
                var userGroup = await _context.UserGroups.FindAsync(userGroupId);
                if (userGroup is null)
                {
                    log.Warning("User group not found. UserGroupId: {UserGroupId}", userGroupId);
                    return NotFound("Group not found");
                }

                _context.UserGroups.Remove(userGroup);
                await _context.SaveChangesAsync();
                log.Info("User group deleted successfully. UserGroupId: {UserGroupId}", userGroupId);
                return NoContent();
            }
            catch (Exception ex)
            {
                log.Error(ex, "Error while deleting user group with ID: {UserGroupId}", userGroupId);
                return StatusCode(500, "An error occurred while deleting the user group.");
            }
        }


        [Authorize(Roles = "Admin,CalendarManager")]
        [HttpPut("editMembers/{userGroupId}")]
        public async Task<ActionResult> EditMembers(Guid userGroupId, [FromBody] UserGroupDto dto)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(EditMembers), transactionId);
            // Use transactions if not in UnitTests
            log.Info("Editing members for user group with ID: {UserGroupId}", userGroupId);
            log.InfoJson("New values for user group members:", dto);
            var useTransaction = !_context.Database.IsInMemory();
            if (useTransaction)
                await _context.Database.BeginTransactionAsync();

            try
            {
                var userGroup = await _context.UserGroups.FindAsync(userGroupId);
                if (userGroup is null)
                {
                    if (useTransaction)
                        await _context.Database.RollbackTransactionAsync();
                    log.Warning("User group not found. UserGroupId: {UserGroupId}", userGroupId);
                    return NotFound("Group not found");
                }

                userGroup.GroupName = dto.GroupName;

                //remove existing members
                var existingMembers = await _context.UserGroupMembers
                    .Where(ug => ug.UserGroupId == userGroupId)
                    .ToListAsync();

                _context.UserGroupMembers.RemoveRange(existingMembers);

                //add new members
                if (dto.Members != null && dto.Members.Any())
                {
                    var newMembers = dto.Members
                        .Select(member => new UserGroupMember
                        {
                            UserGroupId = userGroupId,
                            UserId = member.UserId
                        }).ToList();

                    await _context.UserGroupMembers.AddRangeAsync(newMembers);
                }

                await _context.SaveChangesAsync();

                if (useTransaction)
                    await _context.Database.CommitTransactionAsync();

                log.Info("User group members updated successfully. UserGroupId: {UserGroupId}", userGroupId);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                if (useTransaction)
                    await _context.Database.RollbackTransactionAsync();
                log.ErrorJson(ex, "Error while editing user group members. Values:", dto);
                return StatusCode(500, "An error occurred while updating user group members.");
            }
        }

        [Authorize(Roles = "Admin,CalendarManager")]
        [HttpPost("addMembers/{userGroupId}")]
        public async Task<ActionResult> AddMembers(Guid userGroupId, [FromBody] List<CalendarMemberDto> members)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(AddMembers), transactionId);

            try
            {
                log.Info("Adding members to user group with ID: {UserGroupId}. MembersCount: {MembersCount}", userGroupId, members.Count);
                log.InfoJson("Members payload:", members);
                var userGroup = await _context.UserGroups.FindAsync(userGroupId);
                if (userGroup is null)
                {
                    log.Warning("User group not found. UserGroupId: {UserGroupId}", userGroupId);
                    return NotFound("Group not found");
                }

                var newMembers = members.Select(member => new UserGroupMember
                {
                    UserGroupId = userGroupId,
                    UserId = member.UserId
                }).ToList();

                await _context.UserGroupMembers.AddRangeAsync(newMembers);
                await _context.SaveChangesAsync();

                log.Info("Members added successfully to user group. UserGroupId: {UserGroupId}, MembersAdded: {MembersAdded}", userGroupId, newMembers.Count);
                return Ok(userGroup);
            }
            catch (Exception ex)
            {
                log.ErrorJson(ex, "Error while adding members to user group. Values:", members);
                return StatusCode(500, "An error occurred while adding members to the group.");
            }
        }

        [Authorize(Roles = "Admin,CalendarManager")]
        [HttpDelete("removeMember/{userGroupId}/{userId}")]
        public async Task<ActionResult> RemoveMembers(Guid userGroupId, Guid userId)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(RemoveMembers), transactionId);

            try
            {
                log.Info("Removing member from user group. UserGroupId: {UserGroupId}, UserId: {UserId}", userGroupId, userId);
                var userGroup = await _context.UserGroups.FindAsync(userGroupId);
                if (userGroup is null)
                {
                    log.Warning("User group not found. UserGroupId: {UserGroupId}", userGroupId);
                    return NotFound("Group not found");
                }

                var memberToRemove = await _context.UserGroupMembers
                    .FirstOrDefaultAsync(m => m.UserGroupId == userGroupId && m.UserId == userId);

                if (memberToRemove is null)
                {
                    log.Warning("No matching group member found. UserGroupId: {UserGroupId}, UserId: {UserId}", userGroupId, userId);
                    return NotFound("No matching members found in the group");
                }

                _context.UserGroupMembers.Remove(memberToRemove);
                await _context.SaveChangesAsync();

                log.Info("Member removed successfully from user group. UserGroupId: {UserGroupId}, UserId: {UserId}", userGroupId, userId);
                return Ok(userGroup);
            }
            catch (Exception ex)
            {
                log.Error(ex, "Error while removing member from user group. UserGroupId: {UserGroupId}, UserId: {UserId}", userGroupId, userId);
                return StatusCode(500, "An error occurred while removing the member from the group.");
            }
        }

    }
}
