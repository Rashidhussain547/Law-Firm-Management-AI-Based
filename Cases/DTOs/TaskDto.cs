using LegalFlow.Domain.Enums;
using TS = LegalFlow.Domain.Enums;

namespace LegalFlow.Application.Cases.DTOs;

public class TaskDto
{
    public Guid Id { get; set; }

    public Guid CaseId { get; set; }

    public Guid AssignedToId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public TS.TaskStatus Status { get; set; }

    public TaskPriority Priority { get; set; }

    public DateTime? DueDate { get; set; }

    public DateTime? CompletedAt { get; set; }
}