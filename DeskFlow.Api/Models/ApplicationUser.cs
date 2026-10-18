
using Microsoft.AspNetCore.Identity;

namespace DeskFlow.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;

    public string Role { get; set; } = "Employee";
}
