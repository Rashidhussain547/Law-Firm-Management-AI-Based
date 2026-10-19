using LegalFlow.Domain.Entities;
using LegalFlow.Domain.Enums;

namespace LegalFlow.Application.Cases.DTOs;

public class CaseDto
{
    public Guid Id { get; set; }

    public Guid ClientId { get; set; }

    public Guid? AssignedLawyerId { get; set; }

    public Guid? AssignedAssistantId { get; set; }

    public string? AssignedLawyerName { get; set; }

    public string? AssignedAssistantName { get; set; }

    public string CaseNumber { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public CaseType Type { get; set; }

    public CaseStatus Status { get; set; }

    public string? CourtName { get; set; }

    public string? JudgeName { get; set; }

    public string? OpposingParty { get; set; }

    public DateTime? OpenedDate { get; set; }

    public DateTime? ClosedDate { get; set; }
}