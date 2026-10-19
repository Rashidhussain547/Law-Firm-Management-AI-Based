using LegalFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LegalFlow.Infrastructure.Persistence.Configurations;

public class CaseTaskConfiguration
    : IEntityTypeConfiguration<CaseTask>
{
    public void Configure(EntityTypeBuilder<CaseTask> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(250);

        builder.Property(x => x.Description)
            .HasMaxLength(5000);

        builder.HasIndex(x => new
        {
            x.CaseId,
            x.DueDate
        });

        builder.HasIndex(x => new
        {
            x.AssignedToId,
            x.Status
        });

        builder.HasOne(x => x.Case)
            .WithMany(x => x.Tasks)
            .HasForeignKey(x => x.CaseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.AssignedTo)
            .WithMany()
            .HasForeignKey(x => x.AssignedToId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}