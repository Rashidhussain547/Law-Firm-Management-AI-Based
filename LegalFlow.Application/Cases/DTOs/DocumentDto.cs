using LegalFlow.Domain.Enums;

namespace LegalFlow.Application.Cases.DTOs;

public class DocumentDto
{
    public Guid Id { get; set; }

    public Guid CaseId { get; set; }

    public Guid UploadedById { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string OriginalFileName { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    public long FileSize { get; set; }

    public DocumentType Type { get; set; }

    public string? Description { get; set; }

    public bool IsAiProcessed { get; set; }

    public string? AiSummary { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}