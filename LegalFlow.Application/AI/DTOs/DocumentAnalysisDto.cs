namespace LegalFlow.Application.AI.DTOs;

public class DocumentAnalysisDto
{
    public Guid DocumentId { get; set; }

    public Guid CaseId { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string DocumentType { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public List<string> KeyPoints { get; set; } = new();

    public List<string> ImportantDates { get; set; } = new();

    public List<string> Parties { get; set; } = new();

    public List<string> PotentialIssues { get; set; } = new();

    public List<string> ImportantClauses { get; set; } = new();

    public string RecommendedAction { get; set; } = string.Empty;

    public string Disclaimer { get; set; } =
        "AI-generated document analysis for case management assistance only. It is not legal advice and should be reviewed by a qualified legal professional.";
}