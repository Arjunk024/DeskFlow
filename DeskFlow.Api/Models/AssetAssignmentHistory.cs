
namespace DeskFlow.Api.Models;

public class AssetAssignmentHistory
{
    public int Id { get; set; }

    public int AssetId { get; set; }

    public string? PreviousAssignee { get; set; }

    public string NewAssignee { get; set; } = string.Empty;

    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    public string? Notes { get; set; }

    public Asset? Asset { get; set; }
}
