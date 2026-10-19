namespace LegalFlow.Application.AI.Models;

public class CaseAiContext
{
    public Guid CaseId { get; set; }

    public string CaseNumber { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string Type { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string? CourtName { get; set; }

    public string? JudgeName { get; set; }

    public string? OpposingParty { get; set; }

    public DateTime? OpenedDate { get; set; }

    public DateTime? ClosedDate { get; set; }

    public string? ClientName { get; set; }

    public string? LawyerName { get; set; }

    public string? AssistantName { get; set; }

    public List<CaseAiHearing> Hearings { get; set; } = new();

    public List<CaseAiTask> Tasks { get; set; } = new();

    public List<CaseAiNote> Notes { get; set; } = new();

    public List<CaseAiDocument> Documents { get; set; } = new();
}

public class CaseAiHearing
{
    public DateTime HearingDate { get; set; }

    public string? CourtRoom { get; set; }

    public string? Purpose { get; set; }

    public string Status { get; set; } = string.Empty;

    public string? Notes { get; set; }
}

public class CaseAiTask
{
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string Status { get; set; } = string.Empty;

    public string Priority { get; set; } = string.Empty;

    public DateTime? DueDate { get; set; }

    public DateTime? CompletedAt { get; set; }
}

public class CaseAiNote
{
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}

public class CaseAiDocument
{
    public string FileName { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string Type { get; set; } = string.Empty;

    public bool IsAiProcessed { get; set; }

    public string? AiSummary { get; set; }
}