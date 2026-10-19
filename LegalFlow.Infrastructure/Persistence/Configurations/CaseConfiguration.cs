using LegalFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LegalFlow.Infrastructure.Persistence.Configurations;

public class CaseConfiguration : IEntityTypeConfiguration<Case>
{
    public void Configure(EntityTypeBuilder<Case> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CaseNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(250);

        builder.Property(x => x.Description)
            .HasMaxLength(5000);

        builder.Property(x => x.CourtName)
            .HasMaxLength(200);

        builder.Property(x => x.JudgeName)
            .HasMaxLength(200);

        builder.Property(x => x.OpposingParty)
            .HasMaxLength(250);

        builder.HasIndex(x => new { x.FirmId, x.CaseNumber })
            .IsUnique();

        builder.HasOne(x => x.Firm)
            .WithMany()
            .HasForeignKey(x => x.FirmId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Client)
            .WithMany(x => x.Cases)
            .HasForeignKey(x => x.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.AssignedLawyer)
            .WithMany(x => x.AssignedCases)
            .HasForeignKey(x => x.AssignedLawyerId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}