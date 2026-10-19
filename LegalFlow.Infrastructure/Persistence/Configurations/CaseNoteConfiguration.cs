using LegalFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LegalFlow.Infrastructure.Persistence.Configurations;

public class CaseNoteConfiguration
    : IEntityTypeConfiguration<CaseNote>
{
    public void Configure(EntityTypeBuilder<CaseNote> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Content)
            .IsRequired()
            .HasMaxLength(10000);

        builder.HasIndex(x => new
        {
            x.CaseId,
            x.CreatedById
        });

        builder.HasOne(x => x.Case)
            .WithMany(x => x.Notes)
            .HasForeignKey(x => x.CaseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.CreatedBy)
            .WithMany()
            .HasForeignKey(x => x.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);
    }
}