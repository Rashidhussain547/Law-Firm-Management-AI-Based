using LegalFlow.Domain.Common;
using LDE = LegalFlow.Domain.Enums;

namespace LegalFlow.Domain.Entities;

public class CaseTask : BaseEntity
{
    public Guid CaseId { get; set; }

    public Guid AssignedToId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public LDE.TaskStatus Status { get; set; } = LDE.TaskStatus.Todo;

    public LDE.TaskPriority Priority { get; set; } = LDE.TaskPriority.Medium;

    public DateTime? DueDate { get; set; }

    public DateTime? CompletedAt { get; set; }

    public Case Case { get; set; } = null!;

    public User AssignedTo { get; set; } = null!;
}