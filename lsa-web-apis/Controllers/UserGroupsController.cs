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
        [HttpGet]
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
        [HttpGet]
        public async  Task<ActionResult<UserGroupDto>> Get(Guid id)
        {
            try
            {
                var group = await _context.UserGroups
                    .Include(ug => ug.Members)
                    .ThenInclude(m => m.User)
                    .Where(ug=> ug.Id == id)
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

                if (group == null){ 
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
            // members are not required, but if it has, they should be saved
            // Use transactions if not in UnitTests
            var useTransaction = !_context.Database.IsInMemory();
            if (useTransaction)
                await _context.Database.BeginTransactionAsync();

            try
            {
                var group = _context.UserGroups.Add(new UserGroup { GroupName = dto.GroupName , Active = true});

                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize(Roles = "Admin,CalendarManager")]
        [HttpPut ("{userGroupId}")]
        public async Task<ActionResult> AddMembers(Guid userGroupId, [FromBody] List<UserGroupMemberDto> dto)
        {
            try
            {
                var group = await _context.UserGroups.FindAsync(userGroupId);
                if (group is null)
                {
                    BadRequest();
                }

                foreach (var member in dto)
                {
                    group!.Members.Add(
                        new UserGroupMember { 
                            UserId = member.UserId, 
                            UserGroupId = userGroupId 
                        });
                }
                await _context.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
