using LegalFlow.Domain.Common;
using LegalFlow.Domain.Enums;

namespace LegalFlow.Domain.Entities;

public class CaseHearing : BaseEntity
{
    public Guid CaseId { get; set; }

    public DateTime HearingDate { get; set; }

    public string? CourtRoom { get; set; }

    public string? Purpose { get; set; }

    public HearingStatus Status { get; set; } = HearingStatus.Scheduled;

    public string? Notes { get; set; }

    public Case Case { get; set; } = null!;
}