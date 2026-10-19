using LegalFlow.Application.Cases.DTOs;

namespace LegalFlow.Application.Cases.Interfaces;

public interface ICaseTaskService
{
    Task<List<TaskDto>> GetAllAsync(
        Guid caseId,
        Guid firmId,
        CancellationToken cancellationToken = default);

    Task<TaskDto?> GetByIdAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default);

    Task<TaskDto?> CreateAsync(
        Guid caseId,
        Guid firmId,
        CreateTaskRequest request,
        CancellationToken cancellationToken = default);

    Task<TaskDto?> UpdateAsync(
        Guid id,
        Guid firmId,
        UpdateTaskRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default);
}