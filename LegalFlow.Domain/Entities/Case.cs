using LegalFlow.Domain.Common;
using LegalFlow.Domain.Enums;

namespace LegalFlow.Domain.Entities;

public class Case : BaseEntity
{
    public Guid FirmId { get; set; }

    public Guid ClientId { get; set; }

    public Guid? AssignedLawyerId { get; set; }

    public Guid? AssignedAssistantId { get; set; }

    public User? AssignedAssistant { get; set; }

    public string CaseNumber { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public CaseType Type { get; set; }

    public CaseStatus Status { get; set; } = CaseStatus.Open;

    public string? CourtName { get; set; }

    public string? JudgeName { get; set; }

    public string? OpposingParty { get; set; }

    public DateTime? OpenedDate { get; set; }

    public DateTime? ClosedDate { get; set; }

    public Firm Firm { get; set; } = null!;

    public Client Client { get; set; } = null!;

    public User? AssignedLawyer { get; set; }

    public ICollection<CaseDocument> Documents { get; set; } = new List<CaseDocument>();

    public ICollection<CaseHearing> Hearings { get; set; } = new List<CaseHearing>();

    public ICollection<CaseTask> Tasks { get; set; } = new List<CaseTask>();

    public ICollection<CaseNote> Notes { get; set; } = new List<CaseNote>();
}