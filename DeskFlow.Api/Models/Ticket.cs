
using System.ComponentModel.DataAnnotations;

namespace DeskFlow.Api.Models;

public class Ticket
{
    public int Id { get; set; }

    [Required]
    [MaxLength(30)]
    public string TicketNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string RequesterName { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string Category { get; set; } = "Other";

    [Required]
    [MaxLength(20)]
    public string Priority { get; set; } = "Medium";

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Open";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ResolvedAt { get; set; }
}
