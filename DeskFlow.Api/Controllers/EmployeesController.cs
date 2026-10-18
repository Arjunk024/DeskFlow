
using DeskFlow.Api.Data;
using DeskFlow.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DeskFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly DeskFlowDbContext _context;

    public EmployeesController(DeskFlowDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,IT Support,Employee")]
    public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
    {
        var employees = await _context.Employees
            .OrderBy(employee => employee.FullName)
            .ToListAsync();

        return Ok(employees);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,IT Support,Employee")]
    public async Task<ActionResult<Employee>> GetEmployee(int id)
    {
        var employee = await _context.Employees.FindAsync(id);

        if (employee == null)
            return NotFound();

        return Ok(employee);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,IT Support")]
    public async Task<ActionResult<Employee>> CreateEmployee(Employee employee)
    {
        employee.Id = 0;
        employee.JoinedAt = DateTime.UtcNow;

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetEmployee),
            new { id = employee.Id },
            employee
        );
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,IT Support")]
    public async Task<IActionResult> UpdateEmployee(
        int id,
        Employee updatedEmployee)
    {
        if (id != updatedEmployee.Id)
            return BadRequest("The employee ID does not match.");

        var employee = await _context.Employees.FindAsync(id);

        if (employee == null)
            return NotFound();

        employee.EmployeeCode = updatedEmployee.EmployeeCode;
        employee.FullName = updatedEmployee.FullName;
        employee.Email = updatedEmployee.Email;
        employee.Department = updatedEmployee.Department;
        employee.JobTitle = updatedEmployee.JobTitle;
        employee.Status = updatedEmployee.Status;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var employee = await _context.Employees.FindAsync(id);

        if (employee == null)
            return NotFound();

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
