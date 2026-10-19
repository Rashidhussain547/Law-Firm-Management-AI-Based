namespace LegalFlow.Application.AI.DTOs;

public class CaseSummaryDto
{
    public Guid CaseId { get; set; }

    public string CaseNumber { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Overview { get; set; } = string.Empty;

    public List<string> KeyIssues { get; set; } = new();

    public string CurrentStatus { get; set; } = string.Empty;

    public List<string> ImportantDates { get; set; } = new();

    public List<string> PendingActions { get; set; } = new();

    public List<string> PotentialConcerns { get; set; } = new();

    public string RecommendedNextStep { get; set; } = string.Empty;

    public string Disclaimer { get; set; } =
        "AI-generated summary for case management assistance only. " +
        "It is not legal advice and should be reviewed by a qualified legal professional.";
}