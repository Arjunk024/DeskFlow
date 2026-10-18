using System.ComponentModel.DataAnnotations;

namespace DeskFlow.Api.Models;

public class ActivityLog
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string UserName { get; set; } = "Admin User";

    [Required]
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Target { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}