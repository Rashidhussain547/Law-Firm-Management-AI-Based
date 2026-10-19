using LegalFlow.Domain.Enums;

namespace LegalFlow.Application.Cases.DTOs;

public class HearingDto
{
    public Guid Id { get; set; }

    public Guid CaseId { get; set; }

    public DateTime HearingDate { get; set; }

    public string? CourtRoom { get; set; }

    public string? Purpose { get; set; }

    public HearingStatus Status { get; set; }

    public string? Notes { get; set; }
}