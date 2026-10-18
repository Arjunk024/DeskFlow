using DeskFlow.Api.Data;
using DeskFlow.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DeskFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActivityLogsController : ControllerBase
{
    private readonly DeskFlowDbContext _context;

    public ActivityLogsController(DeskFlowDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ActivityLog>>> GetActivityLogs()
    {
        var logs = await _context.ActivityLogs
            .OrderByDescending(log => log.CreatedAt)
            .Take(10)
            .ToListAsync();

        return Ok(logs);
    }
}