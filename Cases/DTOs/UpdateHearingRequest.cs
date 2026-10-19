using LegalFlow.Domain.Enums;

namespace LegalFlow.Application.Cases.DTOs;

public class UpdateHearingRequest
{
    public DateTime HearingDate { get; set; }

    public string? CourtRoom { get; set; }

    public string? Purpose { get; set; }

    public HearingStatus Status { get; set; }

    public string? Notes { get; set; }
}