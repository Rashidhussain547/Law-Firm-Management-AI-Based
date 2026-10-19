using LegalFlow.Domain.Entities;

namespace LegalFlow.Application.Cases.Interfaces;

public interface ICaseDocumentRepository
{
    Task<List<CaseDocument>> GetAllByCaseIdAsync(
        Guid caseId,
        CancellationToken cancellationToken = default);

    Task<CaseDocument?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        CaseDocument document,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        CaseDocument document,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        CaseDocument document,
        CancellationToken cancellationToken = default);
}