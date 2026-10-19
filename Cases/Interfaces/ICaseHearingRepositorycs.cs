using LegalFlow.Domain.Entities;

namespace LegalFlow.Application.Cases.Interfaces;

public interface ICaseHearingRepository
{
    Task<List<CaseHearing>> GetAllByCaseIdAsync(
        Guid caseId,
        CancellationToken cancellationToken = default);

    Task<CaseHearing?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        CaseHearing hearing,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        CaseHearing hearing,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        CaseHearing hearing,
        CancellationToken cancellationToken = default);
}