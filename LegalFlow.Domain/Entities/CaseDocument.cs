using LegalFlow.Domain.Common;
using LegalFlow.Domain.Enums;

namespace LegalFlow.Domain.Entities;

public class CaseDocument : BaseEntity
{
    public Guid CaseId { get; set; }

    public Guid UploadedById { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string StoragePath { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    public string OriginalFileName { get; set; } = string.Empty;

    public long FileSize { get; set; }

    public DocumentType Type { get; set; }

    public string? Description { get; set; }

    public bool IsAiProcessed { get; set; }

    public string? AiSummary { get; set; }

    public Case Case { get; set; } = null!;

    public User UploadedBy { get; set; } = null!;
}