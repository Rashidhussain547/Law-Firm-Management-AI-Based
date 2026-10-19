using LegalFlow.Domain.Enums;

namespace LegalFlow.Application.Dashboard.DTOs;

public class DashboardDto
{
    public string FirmName { get; set; } = string.Empty;

    public int ActiveCases { get; set; }

    public int TotalClients { get; set; }

    public int HearingsThisWeek { get; set; }

    public int TasksDue { get; set; }

    public CaseOverviewDto CaseOverview { get; set; } = new();

    public List<UpcomingHearingDto> UpcomingHearings { get; set; } = new();

    public List<RecentCaseDto> RecentCases { get; set; } = new();
}

public class CaseOverviewDto
{
    public int Active { get; set; }

    public int Pending { get; set; }

    public int Closed { get; set; }
}

public class UpcomingHearingDto
{
    public Guid Id { get; set; }

    public Guid CaseId { get; set; }

    public DateTime HearingDate { get; set; }

    public string CaseNumber { get; set; } = string.Empty;

    public string CaseTitle { get; set; } = string.Empty;

    public string? CourtName { get; set; }

    public string? CourtRoom { get; set; }

    public HearingStatus Status { get; set; }
}

public class RecentCaseDto
{
    public Guid Id { get; set; }

    public string CaseNumber { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string ClientName { get; set; } = string.Empty;

    public CaseStatus Status { get; set; }

    public DateTime? OpenedDate { get; set; }
}