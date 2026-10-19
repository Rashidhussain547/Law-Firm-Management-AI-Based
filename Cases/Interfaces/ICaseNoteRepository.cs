using LegalFlow.Domain.Entities;

namespace LegalFlow.Application.Cases.Interfaces;

public interface ICaseNoteRepository
{
    Task<List<CaseNote>> GetAllByCaseIdAsync(
        Guid caseId,
        CancellationToken cancellationToken = default);

    Task<CaseNote?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        CaseNote note,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        CaseNote note,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        CaseNote note,
        CancellationToken cancellationToken = default);
}