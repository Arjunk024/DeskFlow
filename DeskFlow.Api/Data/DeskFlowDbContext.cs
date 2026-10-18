
using DeskFlow.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DeskFlow.Api.Data;

public class DeskFlowDbContext : IdentityDbContext<ApplicationUser>
{
    public DeskFlowDbContext(
        DbContextOptions<DeskFlowDbContext> options
    ) : base(options)
    {
    }

    public DbSet<Employee> Employees => Set<Employee>();

    public DbSet<AssetAssignmentHistory> AssetAssignmentHistories
        => Set<AssetAssignmentHistory>();

    public DbSet<Ticket> Tickets => Set<Ticket>();

    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

    public DbSet<AssetMaintenance> AssetMaintenances
        => Set<AssetMaintenance>();

    public DbSet<Asset> Assets => Set<Asset>();
}
