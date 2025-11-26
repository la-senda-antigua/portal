using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace lsa_web_apis.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class UserGroupsController(UserDbContext _context) : ControllerBase
    {
        [Authorize(Roles = "Admin,CalendarManager")]
        [HttpGet("GetAll")]
        public async Task<ActionResult<IEnumerable<UserGroupDto>>> Get()
        {
            try
            {
                var groups = await _context.UserGroups
                    .Include(ug => ug.Members)
                    .ThenInclude(m => m.User)
                    .Select(ug => new UserGroupDto
                    {
                        Id = ug.Id,
                        GroupName = ug.GroupName,
                        Members = ug.Members.Select(m => new UserGroupMemberDto
                        {
                            UserId = m.UserId,
                            Username = m.User.Username,
                            Name = m.User.Name ?? "",
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(groups);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize(Roles = "Admin,CalendarManager")]
        [HttpGet("{id}")]
        public async Task<ActionResult<UserGroupDto>> Get(Guid id)
        {
            try
            {
                var group = await _context.UserGroups
                    .Include(ug => ug.Members)
                    .ThenInclude(m => m.User)
                    .Where(ug => ug.Id == id)
                    .Select(ug => new UserGroupDto
                    {
                        Id = ug.Id,
                        GroupName = ug.GroupName,
                        Members = ug.Members.Select(m => new UserGroupMemberDto
                        {
                            UserId = m.UserId,
                            Username = m.User.Username,
                            Name = m.User.Name ?? "",
                        }).ToList()
                    }).FirstAsync();

                if (group == null)
                {
                    NotFound();
                }

                return Ok(group);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize(Roles = "Admin,CalendarManager")]
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] UserGroupDto dto)
        {
            Console.WriteLine("Creating user group");
            try
            {
                var group = _context.UserGroups.Add(new UserGroup { GroupName = dto.GroupName, Active = true });
                await _context.SaveChangesAsync();
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize(Roles = "Admin,CalendarManager")]
        [HttpPut("{userGroupId}")]
        public async Task<ActionResult> UpdateUserGroup(Guid userGroupId, [FromBody] UserGroupDto dto)
        {
            // Use transactions if not in UnitTests
            var useTransaction = !_context.Database.IsInMemory();
            if (useTransaction)
                await _context.Database.BeginTransactionAsync();

            try
            {
                var userGroup = await _context.UserGroups.FindAsync(userGroupId);
                if (userGroup is null)
                    return NotFound("Group not found");

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

                return Ok(userGroup);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize(Roles = "Admin,CalendarManager")]
        [HttpPost("addMembers/{userGroupId}")]
        public async Task<ActionResult> AddMembers(Guid userGroupId, [FromBody] List<UserGroupMemberDto> members)
        {
            try
            {
                var userGroup = await _context.UserGroups.FindAsync(userGroupId);
                if (userGroup is null)
                    return NotFound("Group not found");

                var newMembers = members.Select(member => new UserGroupMember
                {
                    UserGroupId = userGroupId,
                    UserId = member.UserId
                }).ToList();

                await _context.UserGroupMembers.AddRangeAsync(newMembers);
                await _context.SaveChangesAsync();

                return Ok(userGroup);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize(Roles = "Admin,CalendarManager")]
        [HttpDelete("removeMembers/{userGroupId}")]
        public async Task<ActionResult> RemoveMembers(Guid userGroupId, [FromBody] List<UserGroupMemberDto> members)
        {
            try
            {
                var userGroup = await _context.UserGroups.FindAsync(userGroupId);
                if (userGroup is null)
                    return NotFound("Group not found");

                var membersToRemove = await _context.UserGroupMembers
                    .Where(m => m.UserGroupId == userGroupId && members.Select(x => x.UserId).Contains(m.UserId))
                    .ToListAsync();

                if (!membersToRemove.Any())
                    return NotFound("No matching members found in the group");

                _context.UserGroupMembers.RemoveRange(membersToRemove);
                await _context.SaveChangesAsync();

                return Ok(userGroup);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}
