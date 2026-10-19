using LegalFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LegalFlow.Infrastructure.Persistence.Configurations;

public class CaseDocumentConfiguration
    : IEntityTypeConfiguration<CaseDocument>
{
    public void Configure(EntityTypeBuilder<CaseDocument> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.FileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(x => x.StoragePath)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(x => x.ContentType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.OriginalFileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(x => x.Description)
            .HasMaxLength(1000);

        builder.Property(x => x.AiSummary)
            .HasMaxLength(10000);

        builder.HasIndex(x => x.CaseId);

        builder.HasIndex(x => x.UploadedById);

        builder.HasOne(x => x.Case)
            .WithMany(x => x.Documents)
            .HasForeignKey(x => x.CaseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.UploadedBy)
            .WithMany()
            .HasForeignKey(x => x.UploadedById)
            .OnDelete(DeleteBehavior.Restrict);
    }
}