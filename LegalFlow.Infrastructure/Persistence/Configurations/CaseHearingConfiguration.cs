using LegalFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LegalFlow.Infrastructure.Persistence.Configurations;

public class CaseHearingConfiguration
    : IEntityTypeConfiguration<CaseHearing>
{
    public void Configure(EntityTypeBuilder<CaseHearing> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CourtRoom)
            .HasMaxLength(100);

        builder.Property(x => x.Purpose)
            .HasMaxLength(500);

        builder.Property(x => x.Notes)
            .HasMaxLength(5000);

        builder.HasIndex(x => new
        {
            x.CaseId,
            x.HearingDate
        });

        builder.HasOne(x => x.Case)
            .WithMany(x => x.Hearings)
            .HasForeignKey(x => x.CaseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}