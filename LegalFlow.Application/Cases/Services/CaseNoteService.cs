using LegalFlow.Application.Cases.DTOs;
using LegalFlow.Application.Cases.Interfaces;
using LegalFlow.Domain.Entities;

namespace LegalFlow.Application.Cases.Services;

public class CaseNoteService : ICaseNoteService
{
    private readonly ICaseNoteRepository _noteRepository;
    private readonly ICaseRepository _caseRepository;

    public CaseNoteService(
        ICaseNoteRepository noteRepository,
        ICaseRepository caseRepository)
    {
        _noteRepository = noteRepository;
        _caseRepository = caseRepository;
    }

    public async Task<List<CaseNoteDto>> GetAllAsync(
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
            return new List<CaseNoteDto>();
        }

        var notes = await _noteRepository.GetAllByCaseIdAsync(
            caseId,
            cancellationToken);

        return notes.Select(MapToDto).ToList();
    }

    public async Task<CaseNoteDto?> GetByIdAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        var note = await _noteRepository.GetByIdAsync(
            id,
            cancellationToken);

        if (note is null)
        {
            return null;
        }

        var caseEntity = await _caseRepository.GetByIdAsync(
            note.CaseId,
            firmId,
            cancellationToken);

        if (caseEntity is null)
        {
            return null;
        }

        return MapToDto(note);
    }

    public async Task<CaseNoteDto?> CreateAsync(
        Guid caseId,
        Guid firmId,
        Guid createdById,
        CreateCaseNoteRequest request,
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

        var note = new CaseNote
        {
            Id = Guid.NewGuid(),
            CaseId = caseId,
            CreatedById = createdById,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow
        };

        await _noteRepository.AddAsync(
            note,
            cancellationToken);

        return MapToDto(note);
    }

    public async Task<CaseNoteDto?> UpdateAsync(
        Guid id,
        Guid firmId,
        UpdateCaseNoteRequest request,
        CancellationToken cancellationToken = default)
    {
        var note = await _noteRepository.GetByIdAsync(
            id,
            cancellationToken);

        if (note is null)
        {
            return null;
        }

        var caseEntity = await _caseRepository.GetByIdAsync(
            note.CaseId,
            firmId,
            cancellationToken);

        if (caseEntity is null)
        {
            return null;
        }

        note.Content = request.Content;
        note.UpdatedAt = DateTime.UtcNow;

        await _noteRepository.UpdateAsync(
            note,
            cancellationToken);

        return MapToDto(note);
    }

    public async Task<bool> DeleteAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        var note = await _noteRepository.GetByIdAsync(
            id,
            cancellationToken);

        if (note is null)
        {
            return false;
        }

        var caseEntity = await _caseRepository.GetByIdAsync(
            note.CaseId,
            firmId,
            cancellationToken);

        if (caseEntity is null)
        {
            return false;
        }

        await _noteRepository.DeleteAsync(
            note,
            cancellationToken);

        return true;
    }

    private static CaseNoteDto MapToDto(CaseNote note)
    {
        return new CaseNoteDto
        {
            Id = note.Id,
            CaseId = note.CaseId,
            CreatedById = note.CreatedById,
            Content = note.Content,
            CreatedAt = note.CreatedAt,
            UpdatedAt = note.UpdatedAt
        };
    }
}