
using DeskFlow.Api.Data;
using DeskFlow.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DeskFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssetMaintenanceController : ControllerBase
{
    private readonly DeskFlowDbContext _context;

    public AssetMaintenanceController(DeskFlowDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,IT Support,Employee")]
    public async Task<ActionResult<IEnumerable<AssetMaintenance>>> GetAll()
    {
        var records = await _context.AssetMaintenances
            .OrderByDescending(m => m.ScheduledDate)
            .ToListAsync();

        return Ok(records);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,IT Support,Employee")]
    public async Task<ActionResult<AssetMaintenance>> GetById(int id)
    {
        var record = await _context.AssetMaintenances.FindAsync(id);

        if (record == null)
            return NotFound();

        return Ok(record);
    }

    [HttpGet("asset/{assetId:int}")]
    [Authorize(Roles = "Admin,IT Support,Employee")]
    public async Task<ActionResult<IEnumerable<AssetMaintenance>>> GetByAsset(
        int assetId)
    {
        var assetExists = await _context.Assets
            .AnyAsync(a => a.Id == assetId);

        if (!assetExists)
            return NotFound("Asset not found.");

        var records = await _context.AssetMaintenances
            .Where(m => m.AssetId == assetId)
            .OrderByDescending(m => m.ScheduledDate)
            .ToListAsync();

        return Ok(records);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,IT Support")]
    public async Task<ActionResult<AssetMaintenance>> Create(
        AssetMaintenance record)
    {
        var assetExists = await _context.Assets
            .AnyAsync(a => a.Id == record.AssetId);

        if (!assetExists)
            return BadRequest("The selected asset does not exist.");

        record.Id = 0;
        record.CreatedAt = DateTime.UtcNow;

        _context.AssetMaintenances.Add(record);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = record.Id },
            record);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,IT Support")]
    public async Task<IActionResult> Update(
        int id,
        AssetMaintenance updated)
    {
        if (id != updated.Id)
            return BadRequest("The maintenance record ID does not match.");

        var record = await _context.AssetMaintenances.FindAsync(id);

        if (record == null)
            return NotFound();

        var assetExists = await _context.Assets
            .AnyAsync(a => a.Id == updated.AssetId);

        if (!assetExists)
            return BadRequest("The selected asset does not exist.");

        record.AssetId = updated.AssetId;
        record.Title = updated.Title;
        record.Description = updated.Description;
        record.MaintenanceType = updated.MaintenanceType;
        record.Status = updated.Status;
        record.Cost = updated.Cost;
        record.ScheduledDate = updated.ScheduledDate;
        record.CompletedDate = updated.CompletedDate;
        record.NextServiceDate = updated.NextServiceDate;
        record.Technician = updated.Technician;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var record = await _context.AssetMaintenances.FindAsync(id);

        if (record == null)
            return NotFound();

        _context.AssetMaintenances.Remove(record);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
