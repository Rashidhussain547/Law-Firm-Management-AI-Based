using LegalFlow.Application.Cases.DTOs;

namespace LegalFlow.Application.Cases.Interfaces;

public interface ICaseNoteService
{
    Task<List<CaseNoteDto>> GetAllAsync(
        Guid caseId,
        Guid firmId,
        CancellationToken cancellationToken = default);

    Task<CaseNoteDto?> GetByIdAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default);

    Task<CaseNoteDto?> CreateAsync(
        Guid caseId,
        Guid firmId,
        Guid createdById,
        CreateCaseNoteRequest request,
        CancellationToken cancellationToken = default);

    Task<CaseNoteDto?> UpdateAsync(
        Guid id,
        Guid firmId,
        UpdateCaseNoteRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default);
}