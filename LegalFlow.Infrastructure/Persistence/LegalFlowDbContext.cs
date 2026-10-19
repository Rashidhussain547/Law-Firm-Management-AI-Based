using LegalFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace LegalFlow.Infrastructure.Persistence;

public class LegalFlowDbContext : DbContext
{
    public LegalFlowDbContext(DbContextOptions<LegalFlowDbContext> options)
        : base(options)
    {
    }

    public DbSet<Firm> Firms => Set<Firm>();

    public DbSet<User> Users => Set<User>();

    public DbSet<Client> Clients => Set<Client>();

    public DbSet<Case> Cases => Set<Case>();

    public DbSet<CaseDocument> CaseDocuments => Set<CaseDocument>();

    public DbSet<CaseHearing> CaseHearings => Set<CaseHearing>();

    public DbSet<CaseTask> CaseTasks => Set<CaseTask>();

    public DbSet<CaseNote> CaseNotes => Set<CaseNote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(LegalFlowDbContext).Assembly);

        modelBuilder.Entity<User>()
    .HasOne(x => x.ReportsToUser)
    .WithMany(x => x.Assistants)
    .HasForeignKey(x => x.ReportsToUserId)
    .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Case>()
    .HasOne(x => x.AssignedLawyer)
    .WithMany()
    .HasForeignKey(x => x.AssignedLawyerId)
    .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Case>()
            .HasOne(x => x.AssignedAssistant)
            .WithMany()
            .HasForeignKey(x => x.AssignedAssistantId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}