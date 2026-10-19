using LegalFlow.Domain.Enums;

namespace LegalFlow.Application.Cases.DTOs;

public class CreateCaseRequest
{
    public Guid ClientId { get; set; }

    public Guid? AssignedLawyerId { get; set; }

    public Guid? AssignedAssistantId { get; set; }

    public string CaseNumber { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public CaseType Type { get; set; }

    public string? CourtName { get; set; }

    public string? JudgeName { get; set; }

    public string? OpposingParty { get; set; }

    public DateTime? OpenedDate { get; set; }
}