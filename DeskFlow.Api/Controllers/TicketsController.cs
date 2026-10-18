
using System.ComponentModel.DataAnnotations;
using DeskFlow.Api.Data;
using DeskFlow.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DeskFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly DeskFlowDbContext _context;

    public TicketsController(DeskFlowDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,IT Support,Employee")]
    public async Task<ActionResult<IEnumerable<Ticket>>> GetTickets()
    {
        var tickets = await _context.Tickets
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return Ok(tickets);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,IT Support,Employee")]
    public async Task<ActionResult<Ticket>> GetTicket(int id)
    {
        var ticket = await _context.Tickets.FindAsync(id);

        if (ticket == null)
            return NotFound(new { message = "Ticket not found." });

        return Ok(ticket);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,IT Support,Employee")]
    public async Task<ActionResult<Ticket>> CreateTicket(
        [FromBody] CreateTicketRequest request)
    {
        var ticket = new Ticket
        {
            TicketNumber = $"DF-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}",
            Title = request.Title,
            Description = request.Description ?? string.Empty,
            RequesterName = request.RequesterName,
            Category = request.Category,
            Priority = request.Priority,
            Status = "Open",
            CreatedAt = DateTime.UtcNow
        };

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        _context.ActivityLogs.Add(new ActivityLog
        {
            UserName = User.Identity?.Name ?? "Authenticated User",
            Action = "created ticket",
            Target = ticket.TicketNumber,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticket);
    }

   [HttpPut("{id:int}")]
public async Task<ActionResult<Ticket>> UpdateTicket(
        int id,
        [FromBody] UpdateTicketRequest request)
    {
        var ticket = await _context.Tickets.FindAsync(id);

        if (ticket == null)
            return NotFound(new { message = "Ticket not found." });

        var statusChanged = !string.Equals(
            ticket.Status, request.Status, StringComparison.OrdinalIgnoreCase);

        ticket.Title = request.Title;
        ticket.Description = request.Description ?? string.Empty;
        ticket.RequesterName = request.RequesterName;
        ticket.Category = request.Category;
        ticket.Priority = request.Priority;
        ticket.Status = request.Status;

        if (request.Status.Equals("Resolved", StringComparison.OrdinalIgnoreCase))
            ticket.ResolvedAt ??= DateTime.UtcNow;
        else
            ticket.ResolvedAt = null;

        await _context.SaveChangesAsync();

        if (statusChanged)
        {
            _context.ActivityLogs.Add(new ActivityLog
            {
                UserName = User.Identity?.Name ?? "Authenticated User",
                Action = $"changed status to {ticket.Status}",
                Target = ticket.TicketNumber,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
        }

        return Ok(ticket);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteTicket(int id)
    {
        var ticket = await _context.Tickets.FindAsync(id);

        if (ticket == null)
            return NotFound(new { message = "Ticket not found." });

        _context.Tickets.Remove(ticket);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateTicketRequest
{
    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string RequesterName { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Required, MaxLength(30)]
    public string Category { get; set; } = "Other";

    [Required, MaxLength(20)]
    public string Priority { get; set; } = "Medium";
}

public class UpdateTicketRequest : CreateTicketRequest
{
    [Required, MaxLength(20)]
    public string Status { get; set; } = "Open";
}
