namespace LegalFlow.Application.Cases.DTOs;

public class CaseNoteDto
{
    public Guid Id { get; set; }

    public Guid CaseId { get; set; }

    public Guid CreatedById { get; set; }

    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}