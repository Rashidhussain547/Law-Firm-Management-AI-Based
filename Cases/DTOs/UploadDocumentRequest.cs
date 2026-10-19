using LegalFlow.Domain.Enums;

namespace LegalFlow.Application.Cases.DTOs;

public class UploadDocumentRequest
{
    public string FileName { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    public long FileSize { get; set; }

    public DocumentType Type { get; set; }

    public string? Description { get; set; }
}