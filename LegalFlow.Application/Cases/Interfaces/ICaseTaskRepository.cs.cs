using LegalFlow.Domain.Entities;

namespace LegalFlow.Application.Cases.Interfaces;

public interface ICaseTaskRepository
{
    Task<List<CaseTask>> GetAllByCaseIdAsync(
        Guid caseId,
        CancellationToken cancellationToken = default);

    Task<CaseTask?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        CaseTask task,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        CaseTask task,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        CaseTask task,
        CancellationToken cancellationToken = default);
}