using LegalFlow.Application.Cases.DTOs;
using LegalFlow.Application.Cases.Interfaces;
using LegalFlow.Domain.Entities;

namespace LegalFlow.Application.Cases.Services;

public class CaseHearingService : ICaseHearingService
{
    private readonly ICaseHearingRepository _hearingRepository;
    private readonly ICaseRepository _caseRepository;

    public CaseHearingService(
        ICaseHearingRepository hearingRepository,
        ICaseRepository caseRepository)
    {
        _hearingRepository = hearingRepository;
        _caseRepository = caseRepository;
    }

    public async Task<List<HearingDto>> GetAllAsync(
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
            return new List<HearingDto>();
        }

        var hearings = await _hearingRepository.GetAllByCaseIdAsync(
            caseId,
            cancellationToken);

        return hearings.Select(MapToDto).ToList();
    }

    public async Task<HearingDto?> GetByIdAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        var hearing = await _hearingRepository.GetByIdAsync(
            id,
            cancellationToken);

        if (hearing is null)
        {
            return null;
        }

        var caseEntity = await _caseRepository.GetByIdAsync(
            hearing.CaseId,
            firmId,
            cancellationToken);

        if (caseEntity is null)
        {
            return null;
        }

        return MapToDto(hearing);
    }

    public async Task<HearingDto?> CreateAsync(
        Guid caseId,
        Guid firmId,
        CreateHearingRequest request,
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

        var hearing = new CaseHearing
        {
            Id = Guid.NewGuid(),
            CaseId = caseId,
            HearingDate = request.HearingDate,
            CourtRoom = request.CourtRoom,
            Purpose = request.Purpose,
            Status = request.Status,
            Notes = request.Notes
        };

        await _hearingRepository.AddAsync(
            hearing,
            cancellationToken);

        return MapToDto(hearing);
    }

    public async Task<HearingDto?> UpdateAsync(
        Guid id,
        Guid firmId,
        UpdateHearingRequest request,
        CancellationToken cancellationToken = default)
    {
        var hearing = await _hearingRepository.GetByIdAsync(
            id,
            cancellationToken);

        if (hearing is null)
        {
            return null;
        }

        var caseEntity = await _caseRepository.GetByIdAsync(
            hearing.CaseId,
            firmId,
            cancellationToken);

        if (caseEntity is null)
        {
            return null;
        }

        hearing.HearingDate = request.HearingDate;
        hearing.CourtRoom = request.CourtRoom;
        hearing.Purpose = request.Purpose;
        hearing.Status = request.Status;
        hearing.Notes = request.Notes;
        hearing.UpdatedAt = DateTime.UtcNow;

        await _hearingRepository.UpdateAsync(
            hearing,
            cancellationToken);

        return MapToDto(hearing);
    }

    public async Task<bool> DeleteAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        var hearing = await _hearingRepository.GetByIdAsync(
            id,
            cancellationToken);

        if (hearing is null)
        {
            return false;
        }

        var caseEntity = await _caseRepository.GetByIdAsync(
            hearing.CaseId,
            firmId,
            cancellationToken);

        if (caseEntity is null)
        {
            return false;
        }

        await _hearingRepository.DeleteAsync(
            hearing,
            cancellationToken);

        return true;
    }

    private static HearingDto MapToDto(CaseHearing hearing)
    {
        return new HearingDto
        {
            Id = hearing.Id,
            CaseId = hearing.CaseId,
            HearingDate = hearing.HearingDate,
            CourtRoom = hearing.CourtRoom,
            Purpose = hearing.Purpose,
            Status = hearing.Status,
            Notes = hearing.Notes
        };
    }
}