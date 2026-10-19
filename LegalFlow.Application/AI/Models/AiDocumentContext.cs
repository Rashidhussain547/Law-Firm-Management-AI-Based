namespace LegalFlow.Application.AI.Models;

public class AiDocumentContext
{
    public Guid DocumentId { get; set; }

    public Guid CaseId { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string OriginalFileName { get; set; } = string.Empty;

    public string StoragePath { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    public string DocumentType { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string CaseNumber { get; set; } = string.Empty;

    public string CaseTitle { get; set; } = string.Empty;
}