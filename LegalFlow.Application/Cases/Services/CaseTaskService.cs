using LegalFlow.Application.Cases.DTOs;
using LegalFlow.Application.Cases.Interfaces;
using LegalFlow.Domain.Entities;
using DomainTaskStatus = LegalFlow.Domain.Enums.TaskStatus;

namespace LegalFlow.Application.Cases.Services;

public class CaseTaskService : ICaseTaskService
{
    private readonly ICaseTaskRepository _taskRepository;
    private readonly ICaseRepository _caseRepository;

    public CaseTaskService(
        ICaseTaskRepository taskRepository,
        ICaseRepository caseRepository)
    {
        _taskRepository = taskRepository;
        _caseRepository = caseRepository;
    }

    public async Task<List<TaskDto>> GetAllAsync(
        Guid caseId,
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        var caseEntity = await _caseRepository.GetByIdAsync(
            caseId,
            firmId,
            cancellationToken);

        if (caseEntity is null)
        {
            return new List<TaskDto>();
        }

        var tasks = await _taskRepository.GetAllByCaseIdAsync(
            caseId,
            cancellationToken);

        return tasks.Select(MapToDto).ToList();
    }

    public async Task<TaskDto?> GetByIdAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        var task = await _taskRepository.GetByIdAsync(
            id,
            cancellationToken);

        if (task is null)
        {
            return null;
        }

        var caseEntity = await _caseRepository.GetByIdAsync(
            task.CaseId,
            firmId,
            cancellationToken);

        if (caseEntity is null)
        {
            return null;
        }

        return MapToDto(task);
    }

    public async Task<TaskDto?> CreateAsync(
        Guid caseId,
        Guid firmId,
        CreateTaskRequest request,
        CancellationToken cancellationToken = default)
    {
        var caseEntity = await _caseRepository.GetByIdAsync(
            caseId,
            firmId,
            cancellationToken);

        if (caseEntity is null)
        {
            return null;
        }

        var task = new CaseTask
        {
            Id = Guid.NewGuid(),
            CaseId = caseId,
            AssignedToId = request.AssignedToId,
            Title = request.Title,
            Description = request.Description,
            Status = DomainTaskStatus.Todo,
            Priority = request.Priority,
            DueDate = request.DueDate
        };

        await _taskRepository.AddAsync(
            task,
            cancellationToken);

        return MapToDto(task);
    }

    public async Task<TaskDto?> UpdateAsync(
        Guid id,
        Guid firmId,
        UpdateTaskRequest request,
        CancellationToken cancellationToken = default)
    {
        var task = await _taskRepository.GetByIdAsync(
            id,
            cancellationToken);

        if (task is null)
        {
            return null;
        }

        var caseEntity = await _caseRepository.GetByIdAsync(
            task.CaseId,
            firmId,
            cancellationToken);

        if (caseEntity is null)
        {
            return null;
        }

        task.AssignedToId = request.AssignedToId;
        task.Title = request.Title;
        task.Description = request.Description;
        task.Status = request.Status;
        task.Priority = request.Priority;
        task.DueDate = request.DueDate;

        if (request.Status == DomainTaskStatus.Completed)
        {
            task.CompletedAt ??= DateTime.UtcNow;
        }
        else
        {
            task.CompletedAt = null;
        }

        task.UpdatedAt = DateTime.UtcNow;

        await _taskRepository.UpdateAsync(
            task,
            cancellationToken);

        return MapToDto(task);
    }

    public async Task<bool> DeleteAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        var task = await _taskRepository.GetByIdAsync(
            id,
            cancellationToken);

        if (task is null)
        {
            return false;
        }

        var caseEntity = await _caseRepository.GetByIdAsync(
            task.CaseId,
            firmId,
            cancellationToken);

        if (caseEntity is null)
        {
            return false;
        }

        await _taskRepository.DeleteAsync(
            task,
            cancellationToken);

        return true;
    }

    private static TaskDto MapToDto(CaseTask task)
    {
        return new TaskDto
        {
            Id = task.Id,
            CaseId = task.CaseId,
            AssignedToId = task.AssignedToId,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            DueDate = task.DueDate,
            CompletedAt = task.CompletedAt
        };
    }
}