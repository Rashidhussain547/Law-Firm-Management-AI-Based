namespace LegalFlow.Application.Cases.DTOs;

public class CaseDocumentFile
{
    public Stream Stream { get; set; } = null!;

    public string FileName { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;
}