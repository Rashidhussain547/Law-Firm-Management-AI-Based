using LegalFlow.Application.Cases.DTOs;

namespace LegalFlow.Application.Cases.Interfaces;

public interface ICaseService
{
    Task<List<CaseDto>> GetAllAsync(
        Guid firmId,
        CancellationToken cancellationToken = default);

    Task<CaseDto?> GetByIdAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default);

    Task<CaseDto> CreateAsync(
        Guid firmId,
        CreateCaseRequest request,
        CancellationToken cancellationToken = default);

    Task<CaseDto?> UpdateAsync(
        Guid id,
        Guid firmId,
        UpdateCaseRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default);
}