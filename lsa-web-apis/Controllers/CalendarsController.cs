using lsa_web_apis.Data;
using lsa_web_apis.Entities;
using lsa_web_apis.Extensions;
using lsa_web_apis.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using lsa_web_apis.Services;
using System;
using System.Security.Claims;

namespace lsa_web_apis.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class CalendarsController(UserDbContext _context, IFirebaseNotificationService _firebaseNotificationService, ILogger<CalendarsController> _logger) : ControllerBase
    {
        private string GetRequestUsername() => User.FindFirst(ClaimTypes.Name)?.Value ?? User.Identity?.Name ?? "Anonymous";
        private RequestLogContext CreateLogContext(string actionName, Guid? transactionId = null) => RequestLoggingHelper.CreateContext<CalendarsController>(_logger, User, actionName, transactionId);

        [Authorize(Roles = "Admin,CalendarManager")]
        [HttpGet]
        public async Task<ActionResult<PagedResult<Calendar>>> GetCalendars([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string searchTerm = "")
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(GetCalendars), transactionId);

            try
            {
                log.Info("Getting calendars. Page: {Page}, PageSize: {PageSize}, SearchTerm: {SearchTerm}", page, pageSize, searchTerm);
                if (string.IsNullOrEmpty(searchTerm))
                {
                    var pagedResult = await _context.Calendars
                    .OrderBy(c => c.Id)
                    .ToPagedResultAsync(page, pageSize);

                    log.Debug("Returning {Count} calendars without search term.", pagedResult.Items.Count());

                    return Ok(pagedResult);
                }

                var result = await _context.Calendars
                    .Where(c => !string.IsNullOrEmpty(c.Name) && EF.Functions.Like(c.Name, $"%{searchTerm}%"))
                    .ToPagedResultAsync(page, pageSize);

                log.Debug("Returning {Count} calendars filtered by search term.", result.Items.Count());

                return Ok(result);
            }
            catch (Exception ex)
            {
                log.Error(ex, "Error while getting calendars.");
                return StatusCode(500, "An error occurred while getting calendars.");
            }

        }

        [Authorize(Roles = "Admin,CalendarManager")]
        [HttpGet]
        [Route("getAll")]
        public async Task<ActionResult<List<Calendar>>> GetAll()
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(GetAll), transactionId);

            try
            {
                log.Info("Getting all calendars.");
                var calendars = await _context.Calendars.ToListAsync();
                log.Debug("Returning {Count} calendars.", calendars.Count);
                return Ok(calendars);
            }
            catch (Exception ex)
            {
                log.Error(ex, "Error while getting all calendars.");
                return StatusCode(500, "An error occurred while getting calendars.");
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin,CalendarManager")]
        public async Task<ActionResult<Calendar>> Add([FromBody] CalendarDto dto)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(Add), transactionId);

            try
            {
                log.InfoJson("Adding a new calendar. Values:", dto);
                var calendar = new Calendar
                {
                    Id = Guid.NewGuid(),
                    Name = dto.Name,
                    Active = dto.Active,
                    IsPublic = dto.IsPublic,
                    IsHidden = dto.IsHidden
                };

                _context.Calendars.Add(calendar);
                await _context.SaveChangesAsync();
                log.Info("Added a new calendar with ID: {CalendarId}", calendar.Id);

                return CreatedAtAction(nameof(GetAll), new { id = calendar.Id }, calendar);
            }
            catch (Exception ex)
            {
                log.ErrorJson(ex, "Error while adding calendar. Values:", dto);
                return StatusCode(500, "An error occurred while adding the calendar.");
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,CalendarManager")]
        public async Task<ActionResult<Calendar>> Edit(Guid id, [FromBody] CalendarDto dto)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(Edit), transactionId);
            // Use transactions if not in UnitTests
            log.Info("Editing calendar with ID: {CalendarId}", id);
            log.InfoJson("New values for calendar:", dto);
            var useTransaction = !_context.Database.IsInMemory();
            if (useTransaction)
                await _context.Database.BeginTransactionAsync();

            try
            {
                var calendar = await _context.Calendars.Where(c => c.Id == id).Include(c => c.Managers).FirstOrDefaultAsync();
                if (calendar is null)
                {
                    if (useTransaction)
                        await _context.Database.RollbackTransactionAsync();
                    return NotFound("Calendar not found.");
                }

                var hasPermission = User.IsInRole("Admin") || calendar.Managers.FirstOrDefault(m => m.UserId.ToString() == User.FindFirst(ClaimTypes.NameIdentifier)!.Value) != null;

                if (!hasPermission)
                {
                    if (useTransaction)
                        await _context.Database.RollbackTransactionAsync();
                    log.Warning("User does not have permission to edit calendar with ID: {CalendarId}", id);
                    return StatusCode(403, "You do not have permission to edit this calendar.");
                }

                calendar.Name = dto.Name;
                calendar.Active = dto.Active;
                calendar.IsPublic = dto.IsPublic;
                calendar.IsHidden = dto.IsHidden;

                var managerIds = new HashSet<Guid>(dto.Managers ?? []);

                // Remove existing members
                var existingMembers = await _context.CalendarMembers
                    .Where(cm => cm.CalendarId == id)
                    .ToListAsync();
                _context.CalendarMembers.RemoveRange(existingMembers);

                // Remove existing managers
                var existingManagers = await _context.CalendarManagers
                    .Where(cm => cm.CalendarId == id)
                    .ToListAsync();
                _context.CalendarManagers.RemoveRange(existingManagers);

                // Add new members (excluding those who are managers)
                if (!dto.IsPublic && !dto.IsHidden && dto.Members != null && dto.Members.Count != 0)
                {
                    var newMembers = dto.Members
                        .Where(member => !managerIds.Contains(member))
                        .Select(member => new CalendarMember
                        {
                            CalendarId = id,
                            UserId = member
                        }).ToList();

                    await _context.CalendarMembers.AddRangeAsync(newMembers);
                }

                // Add new managers
                if (dto.Managers != null && dto.Managers.Count != 0)
                {
                    var newManagers = dto.Managers.Select(member => new CalendarManager
                    {
                        CalendarId = id,
                        UserId = member
                    }).ToList();

                    await _context.CalendarManagers.AddRangeAsync(newManagers);

                    // Update user role if needed
                    var newCalendarManagers = await _context.PortalUsers
                        .Where(u => dto.Managers.Contains(u.Id))
                        .ToListAsync();

                    foreach (var newCalendarManager in newCalendarManagers)
                    {
                        var roles = (newCalendarManager.Role ?? string.Empty).Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(r => r.Trim())
                            .ToList();

                        if (!roles.Contains("CalendarManager", StringComparer.OrdinalIgnoreCase) && !roles.Contains("Admin", StringComparer.OrdinalIgnoreCase))
                        {
                            roles.Add("CalendarManager");
                            newCalendarManager.Role = string.Join(",", roles);
                        }
                    }
                }

                await _context.SaveChangesAsync();

                if (useTransaction)
                    await _context.Database.CommitTransactionAsync();

                log.Info("Calendar updated successfully. CalendarId: {CalendarId}", id);

                return Ok(calendar);
            }
            catch (Exception ex)
            {
                if (useTransaction)
                    await _context.Database.RollbackTransactionAsync();
                log.Error(ex, "An error occurred while updating the calendar with ID: {CalendarId}", id);
                return StatusCode(500, "An error occurred while updating the calendar.");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(Delete), transactionId);
            log.Info("Deleting calendar with ID: {CalendarId}", id);
            var useTransaction = !_context.Database.IsInMemory();
            if (useTransaction)
                await _context.Database.BeginTransactionAsync();

            try
            {
                var calendar = await _context.Calendars
                    .Include(c => c.Events)
                    .Include(c => c.Managers)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (calendar is null)
                    return NotFound("Calendar not found.");

                var hasPermission = User.IsInRole("Admin") || calendar.Managers.Any(m => m.UserId.ToString() == User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                if (!hasPermission)
                {
                    log.Warning("User does not have permission to delete calendar with ID: {CalendarId}", id);
                    return Forbid();
                }

                _context.Calendars.Remove(calendar);
                await _context.SaveChangesAsync();

                if (useTransaction)
                    await _context.Database.CommitTransactionAsync();

                log.Info("Calendar deleted successfully. CalendarId: {CalendarId}", id);

                return NoContent();
            }
            catch (Exception ex)
            {
                if (useTransaction)
                    await _context.Database.RollbackTransactionAsync();

                log.Error(ex, "An error occurred while deleting the calendar with ID: {CalendarId}", id);
                return StatusCode(500, "An error occurred while deleting the calendar.");
            }
        }

        [HttpDelete("events/{id}")]
        [Authorize(Roles = "Admin,CalendarManager")]
        public async Task<IActionResult> DeleteEvent(Guid id)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(DeleteEvent), transactionId);
            log.Info("Deleting event with ID: {EventId}", id);
            try
            {
                var calendarEvent = await _context.CalendarEvents.Where(e => e.Id == id).Include(e => e.Calendar).Include(e => e.Calendar.Managers).FirstOrDefaultAsync();
                if (calendarEvent is null)
                    return NotFound("Event not found.");

                var hasPermission = User.IsInRole("Admin") || calendarEvent.Calendar.Managers.Any(m => m.UserId.ToString() == User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                if (!hasPermission)
                {
                    log.Warning("User does not have permission to delete event with ID: {EventId}", id);
                    return StatusCode(403, "You do not have permission to delete this event.");
                }

                _context.CalendarEvents.Remove(calendarEvent);
                await _context.SaveChangesAsync();

                log.Info("Event deleted successfully. EventId: {EventId}", id);

                return NoContent();
            }
            catch (Exception ex)
            {
                log.Error(ex, "An error occurred while deleting the event with ID: {EventId}", id);
                return StatusCode(500, "An error occurred while deleting the event.");
            }

        }

        [HttpGet("myCalendars")]
        [Authorize]
        public async Task<ActionResult<List<CalendarDto>>> GetByUsername()
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(GetByUsername), transactionId);

            try
            {
                var userName = GetRequestUsername();
                log.Info("Getting calendars for user: {Username}", userName);

                IQueryable<Calendar> baseQuery = User.IsInRole("Admin")
                    ? _context.Calendars
                    : _context.Calendars.Where(c => c.IsPublic || c.Managers.Any(m => m.User.Username == userName) || c.Members.Any(m => m.User.Username == userName));

                var paged = await baseQuery
                    .OrderBy(c => c.Name)
                    .Select(c => new CalendarDto
                    {
                        Id = c.Id,
                        Name = c.Name!,
                        Active = c.Active,
                        IsPublic = c.IsPublic,
                        IsHidden = c.IsHidden,
                        Managers = c.Managers.Select(m => m.UserId).ToList(),
                        Members = c.Members.Select(m => m.UserId).ToList()
                    }).ToListAsync();

                log.Info("Returning {Count} calendars for user: {Username}", paged.Count, userName);
                return Ok(paged);
            }
            catch (Exception ex)
            {
                log.Error(ex, "Error while getting calendars by username.");
                return StatusCode(500, "An error occurred while getting calendars.");
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,CalendarManager")]
        public async Task<ActionResult<CalendarDto>> GetById(Guid id)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(GetById), transactionId);

            try
            {
                log.Info("Getting calendar with ID: {CalendarId}", id);
                var calendar = await _context.Calendars
                    .Where(c => c.Id == id)
                    .Select(c => new CalendarDto
                    {
                        Id = c.Id,
                        Name = c.Name!,
                        Active = c.Active,
                        IsPublic = c.IsPublic,
                        IsHidden = c.IsHidden,
                        Managers = c.Managers.Select(m => m.UserId).ToList(),
                        Members = c.Members.Select(m => m.UserId).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (calendar is null)
                    return NotFound("Calendar not found.");

                log.Debug("Returning calendar with ID: {CalendarId}", id);

                return Ok(calendar);
            }
            catch (Exception ex)
            {
                log.Error(ex, "Error while getting calendar with ID: {CalendarId}", id);
                return StatusCode(500, "An error occurred while getting the calendar.");
            }
        }

        public record GetEventsRequest(List<Guid> CalendarIds, DateTime? StartDate, DateTime? EndDate, int Month = 0, int Year = 0);

        [HttpPost("GetEventsByMonth")]
        [Authorize]
        public async Task<ActionResult<List<CalendarEventDto>>> GetEventsByMonth(GetEventsRequest request)
        {
            var startDate = new DateTime(request.Year, request.Month, 1);
            var endDate = startDate.AddMonths(1).AddSeconds(-1);
            var getEventsRequest = new GetEventsRequest(request.CalendarIds, startDate, endDate);
            return await GetEventsByDates(getEventsRequest);
        }

        [HttpPost("GetEventsByDates")]
        [Authorize]
        public async Task<ActionResult<List<CalendarEventDto>>> GetEventsByDates(GetEventsRequest request)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(GetEventsByMonth), transactionId);

            try
            {
                var userName = GetRequestUsername();
                log.Info("Getting events for user: {Username} from: {StartDate} to: {EndDate}", userName, request.StartDate, request.EndDate);
                var startString = request.StartDate?.ToString("yyyy-MM-dd");
                var endString = request.EndDate?.ToString("yyyy-MM-dd") + " 23:59:59";

                if (request.CalendarIds == null || !request.CalendarIds.Any())
                    return new List<CalendarEventDto>();

                var query = _context.CalendarEvents.AsQueryable();

                query = query.Where(e =>
                    request.CalendarIds.Contains(e.CalendarId) &&
                    e.StartTime != null &&
                    e.StartTime.CompareTo(endString) <= 0 &&
                    (e.EndTime == null || e.EndTime.CompareTo(startString) >= 0)
                );

                var rawEvents = await query
                    .Select(e => new
                    {
                        e.Id,
                        e.Title,
                        e.Description,
                        e.CalendarId,
                        e.StartTime,
                        e.EndTime,
                        e.AllDay,
                        CalendarName = e.Calendar.Name,
                        Assignees = e.Assignees.Select(a => new UserDto
                        {
                            UserId = a.User.Id,
                            Username = a.User.Username,
                            Name = a.User.Name,
                            LastName = a.User.LastName,
                            Role = a.User.Role
                        }).ToArray()
                    })
                    .AsNoTracking().ToListAsync();

                var assigneeIds = rawEvents
                    .SelectMany(e => e.Assignees)
                    .Select(u => u.UserId)
                    .Where(id => id.HasValue)
                    .Select(id => id!.Value)
                    .Distinct()
                    .ToList();

                var potentialConflicts = await GetPotentialConflicts(request.StartDate!.Value, request.EndDate!.Value, assigneeIds, transactionId);

                var result = new List<CalendarEventDto>();

                foreach (var e in rawEvents)
                {
                    if (!DateTime.TryParse(e.StartTime, out var start)) continue;
                    DateTime end = string.IsNullOrEmpty(e.EndTime) || !DateTime.TryParse(e.EndTime, out var eEnd) ? start : eEnd;

                    var conflicts = new List<EventConflictDto>();

                    foreach (var assignee in e.Assignees)
                    {
                        if (assignee.UserId == null) continue;

                        var assigneeConflicts = potentialConflicts
                            .Where(pc => pc.Id != e.Id &&
                                         pc.AssigneeIds.Contains(assignee.UserId.Value) &&
                                         string.Compare(pc.StartTime, e.EndTime) < 0 &&
                                         string.Compare(pc.EndTime, e.StartTime) > 0)
                            .ToList();

                        foreach (var conflict in assigneeConflicts)
                        {
                            if (!conflicts.Any(c => c.UserId == assignee.UserId && c.CalendarName == conflict.CalendarName))
                            {
                                conflicts.Add(new EventConflictDto
                                {
                                    UserId = assignee.UserId.Value,
                                    Username = assignee.Username,
                                    Name = assignee.Name ?? "",
                                    LastName = assignee.LastName ?? "",
                                    CalendarName = conflict.CalendarName ?? ""
                                });
                            }
                        }
                    }

                    var intersectionStart = start.Date < request.StartDate?.Date ? request.StartDate.Value.Date : start.Date;
                    var intersectionEnd = end.Date > request.EndDate?.Date ? request.EndDate.Value.Date : end.Date;
                    var totalDays = (intersectionEnd - intersectionStart).Days + 1;

                    for (var date = intersectionStart; date <= intersectionEnd; date = date.AddDays(1))
                    {
                        var currentDay = (date - intersectionStart).Days + 1;
                        result.Add(new CalendarEventDto
                        {
                            Id = e.Id,
                            Title = e.Title,
                            Description = e.Description,
                            CalendarId = e.CalendarId,
                            Start = date == start.Date ? e.StartTime : date.ToString("yyyy-MM-dd HH:mm:ss"),
                            End = e.EndTime,
                            AllDay = e.AllDay,
                            Conflicts = conflicts,
                            Assignees = e.Assignees,
                            DisplayTitle = !string.IsNullOrWhiteSpace(e.Title) ? e.Title :
                                           string.Join(", ", e.Assignees.Select(a => $"{a.Name} {a.LastName}")),
                            CurrentDay = currentDay,
                            TotalDays = totalDays,
                        });
                    }
                }

                log.Info("Returning {Count} events for user: {Username} for month: {Month} and year: {Year}", result.Count, userName, request.Month, request.Year);
                return Ok(result.OrderBy(e => e.Start).ToList());
            }
            catch (Exception ex)
            {
                log.ErrorJson(ex, "Error while getting events by month. Request:", request);
                return StatusCode(500, "An error occurred while getting events.");
            }
        }


        [HttpPost]
        [Authorize(Roles = "Admin,CalendarManager")]
        [Route("addEvent")]
        public async Task<ActionResult<CalendarEventDto>> AddEvent(CalendarEventDto request)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(AddEvent), transactionId);
            var useTransaction = !_context.Database.IsInMemory();
            if (useTransaction) { await _context.Database.BeginTransactionAsync(); }

            try
            {
                log.Info("Adding event to calendar with ID: {CalendarId}", request.CalendarId);
                log.InfoJson("Event details:", request);
                var calendar = await _context.Calendars.Where(c => c.Id == request.CalendarId).Include(c => c.Managers).FirstOrDefaultAsync();
                if (calendar is null)
                {
                    if (useTransaction)
                    {
                        await _context.Database.RollbackTransactionAsync();
                    }
                    return StatusCode(404, "Calendar not found.");
                }

                var hasPermission = User.IsInRole("Admin") || calendar.Managers.FirstOrDefault(m => m.UserId.ToString() == User.FindFirst(ClaimTypes.NameIdentifier)!.Value) != null;
                if (!hasPermission)
                {
                    if (useTransaction)
                    {
                        await _context.Database.RollbackTransactionAsync();
                    }
                    return StatusCode(403, "You do not have permission to add events to this calendar.");
                }

                var calendarEvent = new CalendarEvent
                {
                    Title = request.Title,
                    Description = request.Description,
                    CalendarId = request.CalendarId,
                    StartTime = request.Start!.Replace("T", " "),
                    AllDay = request.AllDay,
                    Id = Guid.NewGuid()
                };

                if (!string.IsNullOrEmpty(request.End))
                {
                    calendarEvent.EndTime = request.End.Replace("T", " ");
                }

                _context.CalendarEvents.Add(calendarEvent);
                await _context.SaveChangesAsync();

                if (request.Assignees?.Length > 0)
                {
                    var assignees = request.Assignees.Select(user =>
                        new CalendarEventAssignee
                        {
                            CalendarEventId = calendarEvent.Id,
                            UserId = user.UserId!.Value
                        }
                    ).ToList();

                    _context.CalendarEventAssignees.AddRange(assignees);
                    await _context.SaveChangesAsync();

                    calendarEvent.Assignees = assignees;
                }

                // Immediately send notifications for events happening within the next 14 days
                if (DateTime.TryParse(calendarEvent.StartTime, out var eventDate))
                {
                    var dias = (eventDate.Date - DateTime.Now.Date).TotalDays;
                    if (dias < 14)
                    {
                        // Get assigned users
                        var assignees = await _context.CalendarEventAssignees
                            .Where(a => a.CalendarEventId == calendarEvent.Id)
                            .Include(a => a.User)
                            .ToListAsync();
                        foreach (var assignee in assignees)
                        {
                            var user = assignee.User;
                            if (user == null || string.IsNullOrEmpty(user.Username)) continue;
                            var userDevices = await _context.UserDevices
                                .Where(d => d.Username == user.Username)
                                .Select(d => d.FirebaseToken)
                                .ToListAsync();
                            if (!userDevices.Any()) continue;
                            var body = $"{calendar.Name} - {eventDate:MMMM dd}";
                            if (!string.IsNullOrWhiteSpace(calendarEvent.Title))
                            {
                                body = $"{calendarEvent.Title}\n{body}";
                            }
                            await _firebaseNotificationService.SendMulticastAsync(
                                userDevices,
                                $"{user.Name} {user.LastName}",
                                body
                            );
                        }
                    }
                }

                if (useTransaction)
                {
                    await _context.Database.CommitTransactionAsync();
                }

                log.Info("Event created successfully for CalendarId: {CalendarId}", request.CalendarId);

                var createdEventDto = new CalendarEventDto
                {
                    Id = calendarEvent.Id,
                    Title = calendarEvent.Title,
                    Description = calendarEvent.Description,
                    CalendarId = calendarEvent.CalendarId,
                    Start = calendarEvent.StartTime,
                    End = calendarEvent.EndTime,
                    AllDay = calendarEvent.AllDay,
                    Assignees = request.Assignees
                };
                return Ok(createdEventDto);
            }
            catch (Exception ex)
            {
                if (useTransaction)
                {
                    await _context.Database.RollbackTransactionAsync();
                }
                log.ErrorJson(ex, "An error occurred while creating the event. Event details:", request);
                return StatusCode(500, "An error occurred while creating the event. All changes have been rolled back.");
            }
        }

        [HttpPut]
        [Authorize(Roles = "Admin,CalendarManager")]
        [Route("updateEvent")]
        public async Task<ActionResult<CalendarEventDto>> UpdateEvent(CalendarEventDto request)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(UpdateEvent), transactionId);
            log.Info("Updating event with ID: {EventId}", request.Id);
            log.InfoJson("New values for event:", request);
            var useTransaction = !_context.Database.IsInMemory();

            try
            {
                var existingEvent = await _context.CalendarEvents
                    .Include(e => e.Assignees)
                    .FirstOrDefaultAsync(e => e.Id == request.Id);

                if (existingEvent is null) return NotFound("Event not found.");

                var calendar = await _context.Calendars.Where(c => c.Id == request.CalendarId).Include(c => c.Managers).FirstOrDefaultAsync();
                if (calendar is null) return NotFound("Calendar not found.");
                var hasPermission = User.IsInRole("Admin") || calendar.Managers.FirstOrDefault(m => m.UserId.ToString() == User.FindFirst(ClaimTypes.NameIdentifier)!.Value) != null;
                if (!hasPermission)
                    return StatusCode(403, "You do not have permission to edit events in this calendar.");

                if (useTransaction) { await _context.Database.BeginTransactionAsync(); }

                _context.Entry(existingEvent).Collection(e => e.Assignees).Load();
                var existingAssignees = existingEvent.Assignees.ToList();

                foreach (var assignee in existingAssignees)
                {
                    existingEvent.Assignees.Remove(assignee);
                }

                existingEvent.Title = request.Title;
                existingEvent.Description = request.Description;
                existingEvent.CalendarId = request.CalendarId;
                existingEvent.StartTime = request.Start!.Replace("T", " ");
                existingEvent.AllDay = request.AllDay;
                existingEvent.EndTime = string.IsNullOrEmpty(request.End) ? null : request.End.Replace("T", " ");

                if (request.Assignees?.Length > 0)
                {
                    var newAssignees = request.Assignees.Select(assignee => new CalendarEventAssignee
                    {
                        UserId = assignee.UserId!.Value,
                        CalendarEventId = request.Id!.Value
                    }).ToList();

                    foreach (var assignee in newAssignees)
                    {
                        existingEvent.Assignees.Add(assignee);
                    }
                }

                _context.Entry(existingEvent).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                if (useTransaction)
                {
                    await _context.Database.CommitTransactionAsync();
                }

                log.Info("Event updated successfully. EventId: {EventId}", request.Id);

                var updatedEventDto = new CalendarEventDto
                {
                    Id = existingEvent.Id,
                    Title = existingEvent.Title,
                    Description = existingEvent.Description,
                    CalendarId = existingEvent.CalendarId,
                    Start = existingEvent.StartTime,
                    End = existingEvent.EndTime,
                    AllDay = existingEvent.AllDay,
                    Assignees = [.. existingEvent.Assignees.Select(a => new UserDto { UserId = a.UserId })]
                };

                return Ok(updatedEventDto);
            }
            catch (Exception ex)
            {
                if (useTransaction)
                {
                    await _context.Database.RollbackTransactionAsync();
                }
                log.ErrorJson(ex, "An error occurred while updating the event. Event details:", request);
                return StatusCode(500, "An error occurred while updating the event. All changes have been rolled back.");
            }
        }

        [HttpGet]
        [Route("GetPublicEvents")]
        public async Task<ActionResult> GetPublicEvents(DateTime? dateTime)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(GetPublicEvents), transactionId);

            try
            {
                log.Info("Getting public events for date: {DateTime}", dateTime);
                if (dateTime is null)
                    dateTime = DateTime.Now;

                var calendar = await _context.Calendars.FirstOrDefaultAsync(c => c.Name == "Eventos Publicos");
                if (calendar == null)
                {
                    log.Warning("Public calendar not found for date: {DateTime}", dateTime);
                    return StatusCode(404, "Calendar not found");
                }

                var dateString = dateTime.Value.ToString("yyyy-MM-dd HH:mm:ss");

                var events = await _context.CalendarEvents
                  .Where(e => string.Compare(e.StartTime, dateString) > 0 && e.CalendarId == calendar.Id)
                  .OrderBy(e => e.StartTime)
                  .Select(e => new CalendarEventDto
                  {
                      Id = e.Id,
                      Title = e.Title,
                      Description = e.Description,
                      CalendarId = e.CalendarId,
                      Start = e.StartTime,
                      End = e.EndTime,
                      AllDay = e.AllDay
                  })
                  .ToListAsync();
                log.Info("Returning {Count} public events for date: {DateTime}", events.Count, dateTime);
                return Ok(events);
            }
            catch (Exception ex)
            {
                log.Error(ex, "Error while getting public events. DateTime: {DateTime}", dateTime);
                return StatusCode(500, "An error occurred while getting public events.");
            }
        }

        public record UserAvailabilityRequest(string[] userIds, string startTime, string endTime);

        [HttpPost]
        [Route("UserAvailability")]
        public async Task<ActionResult> UserAvailability(UserAvailabilityRequest request)
        {
            var transactionId = Guid.NewGuid();
            var log = CreateLogContext(nameof(UserAvailability), transactionId);

            try
            {
                var userName = GetRequestUsername();
                log.Info("Checking user availability for user: {Username}", userName);
                log.InfoJson("Request details:", request);

                var userGuids = request.userIds
                    .Select(Guid.Parse)
                    .ToArray();

                var reqStartTime = request.startTime.Replace("T", " ");
                var reqEndTime = request.endTime.Replace("T", " ");

                var conflictingEvents = await _context.CalendarEvents
                    .Where(e =>
                        e.StartTime != null &&
                        e.EndTime != null &&
                        string.Compare(e.StartTime, reqEndTime) < 0 &&
                        string.Compare(e.EndTime, reqStartTime) > 0 &&
                        e.Assignees.Any(a => userGuids.Contains(a.UserId))
                    )
                    .Include(e => e.Calendar)
                    .Include(e => e.Assignees)
                        .ThenInclude(a => a.User)
                    .AsNoTracking()
                    .ToListAsync();

                log.Info("Found {Count} conflicting events for user availability check for user: {Username}", conflictingEvents.Count, userName);
                log.InfoJson("Request details:", request);

                var result = conflictingEvents
                    .SelectMany(e => e.Assignees
                        .Where(a => userGuids.Contains(a.UserId))
                        .Select(a => new
                        {
                            a.User,
                            e.Calendar,
                            EventId = e.Id,
                        }))
                    .GroupBy(x => x.User.Id)
                    .Select(g => new
                    {
                        user = new CalendarMemberDto
                        {
                            UserId = g.Key,
                            Username = g.First().User.Username,
                            Name = g.First().User.Name,
                            LastName = g.First().User.LastName
                        },
                        conflicts = g
                            .Select(x => new
                            {
                                x.Calendar.Id,
                                x.Calendar.Name,
                                x.EventId,
                            })
                            .DistinctBy(c => c.Id)
                            .ToList()
                    })
                    .ToList();

                log.Info("Returning {Count} user availability results for user: {Username}", result.Count, userName);
                log.InfoJson("Request details:", request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                log.ErrorJson(ex, "Error while checking user availability. Request details:", request);
                return StatusCode(500, "An error occurred while checking user availability.");
            }
        }

        private async Task<List<PotentialConflict>> GetPotentialConflicts(DateTime startDate, DateTime endDate, List<Guid> assigneeIds, Guid transactionId)
        {
            var log = CreateLogContext(nameof(GetPotentialConflicts), transactionId);
            log.Debug("Getting potential conflicts. StartDate: {StartDate}, EndDate: {EndDate}, AssigneeCount: {AssigneeCount}", startDate, endDate, assigneeIds.Count);

            if (!assigneeIds.Any())
            {
                log.Debug("No assignees provided. Returning empty conflicts list.");
                return new List<PotentialConflict>();
            }

            var conflicts = await _context.CalendarEvents
                .IgnoreQueryFilters()
                .Where(e => e.StartTime != null && e.EndTime != null &&
                            string.Compare(e.StartTime, endDate.ToString("yyyy-MM-dd HH:mm:ss")) <= 0 &&
                            string.Compare(e.EndTime, startDate.ToString("yyyy-MM-dd HH:mm:ss")) >= 0 &&
                            e.Assignees.Any(a => assigneeIds.Contains(a.UserId)))
                .Select(e => new PotentialConflict
                {
                    Id = e.Id,
                    Title = e.Title,
                    StartTime = e.StartTime,
                    EndTime = e.EndTime,
                    CalendarName = e.Calendar.Name,
                    AssigneeIds = e.Assignees.Select(a => a.UserId).ToList()
                })
                .AsNoTracking()
                .ToListAsync();

            log.Debug("Found {Count} potential conflicts.", conflicts.Count);
            return conflicts;
        }

        private class PotentialConflict
        {
            public Guid Id { get; set; }
            public string? Title { get; set; }
            public string? StartTime { get; set; }
            public string? EndTime { get; set; }
            public string? CalendarName { get; set; }
            public List<Guid> AssigneeIds { get; set; } = new();
        }
    }
}
