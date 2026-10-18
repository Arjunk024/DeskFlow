
using DeskFlow.Api.Data;
using DeskFlow.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DeskFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssetsController : ControllerBase
{
    private readonly DeskFlowDbContext _context;

    public AssetsController(DeskFlowDbContext context)
    {
        _context = context;
    }

    // GET: api/assets
    [HttpGet]
    [Authorize(Roles = "Admin,IT Support,Employee")]
    public async Task<ActionResult<IEnumerable<Asset>>> GetAssets()
    {
        var assets = await _context.Assets
            .OrderByDescending(asset => asset.CreatedAt)
            .ToListAsync();

        return Ok(assets);
    }

    // GET: api/assets/5
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,IT Support,Employee")]
    public async Task<ActionResult<Asset>> GetAsset(int id)
    {
        var asset = await _context.Assets.FindAsync(id);

        if (asset == null)
        {
            return NotFound();
        }

        return Ok(asset);
    }

    // GET: api/assets/5/assignment-history
    [HttpGet("{id:int}/assignment-history")]
    [Authorize(Roles = "Admin,IT Support,Employee")]
    public async Task<ActionResult<IEnumerable<AssetAssignmentHistory>>>
        GetAssignmentHistory(int id)
    {
        var assetExists = await _context.Assets
            .AnyAsync(asset => asset.Id == id);

        if (!assetExists)
        {
            return NotFound("Asset not found.");
        }

        var history = await _context.AssetAssignmentHistories
            .Where(record => record.AssetId == id)
            .OrderByDescending(record => record.ChangedAt)
            .ToListAsync();

        return Ok(history);
    }

    // POST: api/assets
    [HttpPost]
    [Authorize(Roles = "Admin,IT Support")]
    public async Task<ActionResult<Asset>> CreateAsset(Asset asset)
    {
        asset.Id = 0;
        asset.CreatedAt = DateTime.UtcNow;

        _context.Assets.Add(asset);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetAsset),
            new { id = asset.Id },
            asset
        );
    }

    // PUT: api/assets/5
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,IT Support")]
    public async Task<IActionResult> UpdateAsset(
        int id,
        Asset updatedAsset)
    {
        if (id != updatedAsset.Id)
        {
            return BadRequest("The asset ID does not match.");
        }

        var asset = await _context.Assets.FindAsync(id);

        if (asset == null)
        {
            return NotFound();
        }

        var previousAssignee = asset.AssignedTo;
        var newAssignee = updatedAsset.AssignedTo;

        bool assignmentChanged = !string.Equals(
            previousAssignee?.Trim() ?? "",
            newAssignee?.Trim() ?? "",
            StringComparison.OrdinalIgnoreCase
        );

        if (assignmentChanged)
        {
            _context.AssetAssignmentHistories.Add(
                new AssetAssignmentHistory
                {
                    AssetId = asset.Id,
                    PreviousAssignee =
                        string.IsNullOrWhiteSpace(previousAssignee)
                            ? null
                            : previousAssignee.Trim(),
                    NewAssignee =
                        string.IsNullOrWhiteSpace(newAssignee)
                            ? "(Unassigned)"
                            : newAssignee.Trim(),
                    ChangedAt = DateTime.UtcNow
                }
            );
        }

        asset.AssetTag = updatedAsset.AssetTag;
        asset.Name = updatedAsset.Name;
        asset.Category = updatedAsset.Category;
        asset.Manufacturer = updatedAsset.Manufacturer;
        asset.Model = updatedAsset.Model;
        asset.AssignedTo = updatedAsset.AssignedTo;
        asset.Status = updatedAsset.Status;
        asset.PurchaseDate = updatedAsset.PurchaseDate;
        asset.WarrantyExpiry = updatedAsset.WarrantyExpiry;
        asset.Notes = updatedAsset.Notes;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/assets/5
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteAsset(int id)
    {
        var asset = await _context.Assets.FindAsync(id);

        if (asset == null)
        {
            return NotFound();
        }

        _context.Assets.Remove(asset);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
