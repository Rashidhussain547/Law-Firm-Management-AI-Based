using FluentValidation;
using LegalFlow.Application.Auth.Interfaces;
using LegalFlow.Application.Cases.DTOs;
using LegalFlow.Application.Cases.Interfaces;
using LegalFlow.Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LegalFlow.Api.Controllers;

[ApiController]
[Route("api/cases/{caseId:guid}/hearings")]
[Authorize]
public class CaseHearingsController : ControllerBase
{
    private readonly ICaseHearingService _hearingService;
    private readonly ICurrentUserService _currentUser;
    private readonly IValidator<CreateHearingRequest> _createValidator;
    private readonly IValidator<UpdateHearingRequest> _updateValidator;

    public CaseHearingsController(
        ICaseHearingService hearingService,
        ICurrentUserService currentUser,
        IValidator<CreateHearingRequest> createValidator,
        IValidator<UpdateHearingRequest> updateValidator)
    {
        _hearingService = hearingService;
        _currentUser = currentUser;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<ActionResult<List<HearingDto>>> GetAll(
        Guid caseId,
        CancellationToken cancellationToken)
    {
        var hearings = await _hearingService.GetAllAsync(
            caseId,
            _currentUser.FirmId,
            cancellationToken);

        return Ok(hearings);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<HearingDto>> GetById(
        Guid caseId,
        Guid id,
        CancellationToken cancellationToken)
    {
        var hearing = await _hearingService.GetByIdAsync(
            id,
            _currentUser.FirmId,
            cancellationToken);

        if (hearing is null || hearing.CaseId != caseId)
        {
            return NotFound();
        }

        return Ok(hearing);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Lawyer")]
    public async Task<ActionResult<HearingDto>> Create(
        Guid caseId,
        [FromBody] CreateHearingRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await _createValidator.ValidateAsync(
            request,
            cancellationToken);

        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(x => x.PropertyName)
                .ToDictionary(
                    x => char.ToLowerInvariant(x.Key[0]) + x.Key[1..],
                    x => x.Select(e => e.ErrorMessage).ToArray());

            return BadRequest(
                ApiResponse<HearingDto>.FailureResponse(
                    "Validation failed.",
                    errors));
        }

        var hearing = await _hearingService.CreateAsync(
            caseId,
            _currentUser.FirmId,
            request,
            cancellationToken);

        if (hearing is null)
        {
            return NotFound();
        }

        return CreatedAtAction(
            nameof(GetById),
            new
            {
                caseId,
                id = hearing.Id
            },
            hearing);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Lawyer")]
    public async Task<ActionResult<HearingDto>> Update(
        Guid caseId,
        Guid id,
        [FromBody] UpdateHearingRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await _updateValidator.ValidateAsync(
            request,
            cancellationToken);

        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(x => x.PropertyName)
                .ToDictionary(
                    x => char.ToLowerInvariant(x.Key[0]) + x.Key[1..],
                    x => x.Select(e => e.ErrorMessage).ToArray());

            return BadRequest(
                ApiResponse<HearingDto>.FailureResponse(
                    "Validation failed.",
                    errors));
        }

        var hearing = await _hearingService.UpdateAsync(
            id,
            _currentUser.FirmId,
            request,
            cancellationToken);

        if (hearing is null || hearing.CaseId != caseId)
        {
            return NotFound();
        }

        return Ok(hearing);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Lawyer")]
    public async Task<IActionResult> Delete(
        Guid caseId,
        Guid id,
        CancellationToken cancellationToken)
    {
        var hearing = await _hearingService.GetByIdAsync(
            id,
            _currentUser.FirmId,
            cancellationToken);

        if (hearing is null || hearing.CaseId != caseId)
        {
            return NotFound();
        }

        var deleted = await _hearingService.DeleteAsync(
            id,
            _currentUser.FirmId,
            cancellationToken);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}