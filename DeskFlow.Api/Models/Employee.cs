
using System.ComponentModel.DataAnnotations;

namespace DeskFlow.Api.Models;

public class Employee
{
    public int Id { get; set; }

    [Required, MaxLength(30)]
    public string EmployeeCode { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Department { get; set; } = string.Empty;

    [MaxLength(100)]
    public string JobTitle { get; set; } = string.Empty;

    [Required, MaxLength(30)]
    public string Status { get; set; } = "Active";

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}
