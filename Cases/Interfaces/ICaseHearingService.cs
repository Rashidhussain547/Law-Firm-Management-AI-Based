using LegalFlow.Application.Cases.DTOs;

namespace LegalFlow.Application.Cases.Interfaces;

public interface ICaseHearingService
{
    Task<List<HearingDto>> GetAllAsync(
        Guid caseId,
        Guid firmId,
        CancellationToken cancellationToken = default);

    Task<HearingDto?> GetByIdAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default);

    Task<HearingDto?> CreateAsync(
        Guid caseId,
        Guid firmId,
        CreateHearingRequest request,
        CancellationToken cancellationToken = default);

    Task<HearingDto?> UpdateAsync(
        Guid id,
        Guid firmId,
        UpdateHearingRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default);
}