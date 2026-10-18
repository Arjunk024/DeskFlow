
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DeskFlow.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace DeskFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    public record RegisterRequest(
        string FullName,
        string Email,
        string Password);

    public record LoginRequest(
        string Email,
        string Password);

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new
            {
                message = "Full name, email, and password are required."
            });
        }

        var existingUser = await _userManager.FindByEmailAsync(request.Email);

        if (existingUser is not null)
        {
            return Conflict(new { message = "Email is already registered." });
        }

        var user = new ApplicationUser
        {
            UserName = request.Email.Trim(),
            Email = request.Email.Trim(),
            FullName = request.FullName.Trim(),
            Role = "Employee"
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                errors = result.Errors.Select(error => error.Description)
            });
        }

        // Public registration always creates Employee accounts.
        return Ok(new { message = "Registration successful. You can now log in." });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email.Trim());

        if (user is null ||
            !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        var key = _configuration["Jwt:Key"];

        if (string.IsNullOrWhiteSpace(key) ||
            Encoding.UTF8.GetByteCount(key) < 32)
        {
            return StatusCode(500, new
            {
                message = "JWT signing key is not configured correctly."
            });
        }

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.Role)
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));

        var credentials = new SigningCredentials(
            signingKey,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                _configuration.GetValue<int>("Jwt:ExpiryMinutes", 60)),
            signingCredentials: credentials);

        return Ok(new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token),
            expiresAt = token.ValidTo,
            user = new
            {
                id = user.Id,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role
            }
        });
    }
}
