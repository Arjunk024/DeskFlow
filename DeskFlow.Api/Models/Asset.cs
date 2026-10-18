
using System.ComponentModel.DataAnnotations;

namespace DeskFlow.Api.Models;

public class Asset
{
    public int Id { get; set; }

    [Required, MaxLength(30)]
    public string AssetTag { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Category { get; set; } = "Laptop";

    [MaxLength(100)]
    public string Manufacturer { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Model { get; set; } = string.Empty;

    [MaxLength(100)]
    public string AssignedTo { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string Status { get; set; } = "Healthy";

    public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;

    public DateTime? WarrantyExpiry { get; set; }

    [MaxLength(1000)]
    public string Notes { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
