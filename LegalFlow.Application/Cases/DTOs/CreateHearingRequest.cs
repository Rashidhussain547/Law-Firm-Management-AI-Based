using LegalFlow.Domain.Enums;

namespace LegalFlow.Application.Cases.DTOs;

public class CreateHearingRequest
{
    public DateTime HearingDate { get; set; }

    public string? CourtRoom { get; set; }

    public string? Purpose { get; set; }

    public HearingStatus Status { get; set; } = HearingStatus.Scheduled;

    public string? Notes { get; set; }
}