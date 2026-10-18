
namespace DeskFlow.Api.Models;

public class AssetMaintenance
{
    public int Id { get; set; }

    public int AssetId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string MaintenanceType { get; set; } = "Repair";

    public string Status { get; set; } = "Scheduled";

    public decimal Cost { get; set; }

    public DateTime ScheduledDate { get; set; }

    public DateTime? CompletedDate { get; set; }

    public DateTime? NextServiceDate { get; set; }

    public string? Technician { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
