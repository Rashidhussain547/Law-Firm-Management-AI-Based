using LegalFlow.Application.Auth.Interfaces;
using FluentValidation;
using LegalFlow.Application.Cases.DTOs;
using LegalFlow.Application.Cases.Interfaces;
using LegalFlow.Domain.Entities;
using LegalFlow.Domain.Enums;

namespace LegalFlow.Application.Cases.Services;

public class CaseService : ICaseService
{
    private readonly ICaseRepository _caseRepository;
    private readonly ICurrentUserService _currentUser;

    public CaseService(ICaseRepository caseRepository, ICurrentUserService currentUser)
    {
        _caseRepository = caseRepository;
        _currentUser = currentUser;
    }

    public async Task<List<CaseDto>> GetAllAsync(
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        var cases = await _caseRepository.GetAllAsync(
            firmId,
            cancellationToken);

        return cases.Select(MapToDto).ToList();
    }

    public async Task<CaseDto?> GetByIdAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        var caseEntity = await _caseRepository.GetByIdAsync(
            id,
            firmId,
            cancellationToken);

        return caseEntity is null
            ? null
            : MapToDto(caseEntity);
    }

    public async Task<CaseDto> CreateAsync(
     Guid firmId,
     CreateCaseRequest request,
     CancellationToken cancellationToken = default)
    {
        if (_currentUser.Role == (UserRole.Assistant).ToString())
        {
            throw new UnauthorizedAccessException(
                "Assistants cannot create cases.");
        }

        var caseNumberExists =
            await _caseRepository.ExistsByCaseNumberAsync(
                firmId,
                request.CaseNumber,
                cancellationToken);

        if (caseNumberExists)
        {
            throw new InvalidOperationException(
                "A case with this case number already exists.");
        }

        Guid? assignedLawyerId;

        if (_currentUser.Role == (UserRole.Admin).ToString())
        {
            if (!request.AssignedLawyerId.HasValue)
            {
                throw new ValidationException(
                    "A lawyer must be assigned to the case.");
            }

            assignedLawyerId = request.AssignedLawyerId.Value;
        }
        else if (_currentUser.Role == (UserRole.Lawyer).ToString())
        {
            assignedLawyerId = _currentUser.UserId;
        }
        else
        {
            throw new UnauthorizedAccessException(
                "You are not authorized to create cases.");
        }

        var lawyer =
            await _caseRepository.GetUserByIdAndFirmIdAsync(
                assignedLawyerId.Value,
                firmId,
                cancellationToken);

        if (lawyer is null)
        {
            throw new ValidationException(
                "Assigned lawyer was not found.");
        }

        if (!lawyer.IsActive)
        {
            throw new ValidationException(
                "Assigned lawyer is inactive.");
        }

        if (lawyer.Role != (UserRole.Lawyer).ToString())
        {
            throw new ValidationException(
                "Selected user is not a lawyer.");
        }

        User? assistant = null;

        if (request.AssignedAssistantId.HasValue)
        {
            assistant =
                await _caseRepository.GetUserByIdAndFirmIdAsync(
                    request.AssignedAssistantId.Value,
                    firmId,
                    cancellationToken);

            if (assistant is null)
            {
                throw new ValidationException(
                    "Assigned assistant was not found.");
            }

            if (!assistant.IsActive)
            {
                throw new ValidationException(
                    "Assigned assistant is inactive.");
            }

            if (assistant.Role != (UserRole.Assistant).ToString())
            {
                throw new ValidationException(
                    "Selected user is not an assistant.");
            }

            if (assistant.ReportsToUserId != assignedLawyerId)
            {
                throw new ValidationException(
                    "Assistant does not belong to the selected lawyer.");
            }
        }

        var caseEntity = new Case
        {
            Id = Guid.NewGuid(),

            FirmId = firmId,

            ClientId = request.ClientId,

            AssignedLawyerId = assignedLawyerId,

            AssignedAssistantId = assistant?.Id,

            CaseNumber = request.CaseNumber,

            Title = request.Title,

            Description = request.Description,

            Type = request.Type,

            Status = CaseStatus.Open,

            CourtName = request.CourtName,

            JudgeName = request.JudgeName,

            OpposingParty = request.OpposingParty,

            OpenedDate = request.OpenedDate.HasValue
                ? DateTime.SpecifyKind(
                    request.OpenedDate.Value,
                    DateTimeKind.Utc)
                : null
        };

        await _caseRepository.AddAsync(
     caseEntity,
     cancellationToken);

        var createdCase = await _caseRepository.GetByIdAsync(
            caseEntity.Id,
            firmId,
            cancellationToken);

        return MapToDto(createdCase!);
    }

    public async Task<CaseDto?> UpdateAsync(
        Guid id,
        Guid firmId,
        UpdateCaseRequest request,
        CancellationToken cancellationToken = default)
    {
        if (_currentUser.Role == (UserRole.Assistant).ToString())
        {
            throw new UnauthorizedAccessException(
                "Assistants cannot update cases.");
        }

        var caseEntity = await _caseRepository.GetByIdAsync(
            id,
            firmId,
            cancellationToken);

        if (caseEntity is null || caseEntity.FirmId != firmId)
        {
            return null;
        }

        Guid? assignedLawyerId;

        if (_currentUser.Role == (UserRole.Admin).ToString())
        {
            if (!request.AssignedLawyerId.HasValue)
            {
                throw new ValidationException(
                    "A lawyer must be assigned to the case.");
            }

            assignedLawyerId = request.AssignedLawyerId.Value;
        }
        else
        {
            assignedLawyerId = _currentUser.UserId;
        }

        var lawyer =
            await _caseRepository.GetUserByIdAndFirmIdAsync(
                assignedLawyerId.Value,
                firmId,
                cancellationToken);

        if (lawyer is null ||
            !lawyer.IsActive ||
            lawyer.Role != (UserRole.Lawyer).ToString())
        {
            throw new ValidationException(
                "Invalid assigned lawyer.");
        }

        User? assistant = null;

        if (request.AssignedAssistantId.HasValue)
        {
            assistant =
                await _caseRepository.GetUserByIdAndFirmIdAsync(
                    request.AssignedAssistantId.Value,
                    firmId,
                    cancellationToken);

            if (assistant is null)
            {
                throw new ValidationException(
                    "Assigned assistant was not found.");
            }

            if (!assistant.IsActive)
            {
                throw new ValidationException(
                    "Assigned assistant is inactive.");
            }

            if (assistant.Role != (UserRole.Assistant).ToString())
            {
                throw new ValidationException(
                    "Selected user is not an assistant.");
            }

            if (assistant.ReportsToUserId != assignedLawyerId)
            {
                throw new ValidationException(
                    "Assistant does not belong to the selected lawyer.");
            }
        }

        caseEntity.ClientId = request.ClientId;

        caseEntity.AssignedLawyerId = assignedLawyerId;

        caseEntity.AssignedAssistantId = assistant?.Id;

        caseEntity.CaseNumber = request.CaseNumber;

        caseEntity.Title = request.Title;

        caseEntity.Description = request.Description;

        caseEntity.Type = request.Type;

        caseEntity.Status = request.Status;

        caseEntity.CourtName = request.CourtName;

        caseEntity.JudgeName = request.JudgeName;

        caseEntity.OpposingParty = request.OpposingParty;

        caseEntity.OpenedDate =
            request.OpenedDate.HasValue
                ? DateTime.SpecifyKind(
                    request.OpenedDate.Value,
                    DateTimeKind.Utc)
                : null;

        caseEntity.ClosedDate =
            request.ClosedDate.HasValue
                ? DateTime.SpecifyKind(
                    request.ClosedDate.Value,
                    DateTimeKind.Utc)
                : null;

        caseEntity.UpdatedAt = DateTime.UtcNow;

        await _caseRepository.UpdateAsync(
            caseEntity,
            cancellationToken);

        return MapToDto(caseEntity);
    }

    public async Task<bool> DeleteAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        var caseEntity = await _caseRepository.GetByIdAsync(
            id,
            firmId,
            cancellationToken);

        if (caseEntity is null || caseEntity.FirmId != firmId)
        {
            return false;
        }

        await _caseRepository.DeleteAsync(
            caseEntity,
            cancellationToken);

        return true;
    }

    private static CaseDto MapToDto(Case caseEntity)
    {
        return new CaseDto
        {
            Id = caseEntity.Id,

            ClientId = caseEntity.ClientId,

            AssignedLawyerId = caseEntity.AssignedLawyerId,

            AssignedLawyerName =
                caseEntity.AssignedLawyer is null
                    ? null
                    : $"{caseEntity.AssignedLawyer.FirstName} {caseEntity.AssignedLawyer.LastName}",

            AssignedAssistantId = caseEntity.AssignedAssistantId,

            AssignedAssistantName =
                caseEntity.AssignedAssistant is null
                    ? null
                    : $"{caseEntity.AssignedAssistant.FirstName} {caseEntity.AssignedAssistant.LastName}",

            CaseNumber = caseEntity.CaseNumber,

            Title = caseEntity.Title,

            Description = caseEntity.Description,

            Type = caseEntity.Type,

            Status = caseEntity.Status,

            CourtName = caseEntity.CourtName,

            JudgeName = caseEntity.JudgeName,

            OpposingParty = caseEntity.OpposingParty,

            OpenedDate = caseEntity.OpenedDate,

            ClosedDate = caseEntity.ClosedDate
        };
    }


}