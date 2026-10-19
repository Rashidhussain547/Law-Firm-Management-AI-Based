using LegalFlow.Domain.Enums;

namespace LegalFlow.Application.Cases.DTOs;

public class CreateTaskRequest
{
    public Guid AssignedToId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public TaskPriority Priority { get; set; } = TaskPriority.Medium;

    public DateTime? DueDate { get; set; }
}