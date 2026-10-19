using FluentValidation;
using LegalFlow.Application.Auth.Interfaces;
using LegalFlow.Application.Cases.DTOs;
using LegalFlow.Application.Cases.Interfaces;
using LegalFlow.Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LegalFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CasesController : ControllerBase
{
    private readonly ICaseService _caseService;
    private readonly ICurrentUserService _currentUser;
    private readonly IValidator<CreateCaseRequest> _createValidator;
    private readonly IValidator<UpdateCaseRequest> _updateValidator;

    public CasesController(
        ICaseService caseService,
        ICurrentUserService currentUser,
        IValidator<CreateCaseRequest> createValidator,
        IValidator<UpdateCaseRequest> updateValidator)
    {
        _caseService = caseService;
        _currentUser = currentUser;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<ActionResult<List<CaseDto>>> GetAll(
        CancellationToken cancellationToken)
    {
        var cases = await _caseService.GetAllAsync(
            _currentUser.FirmId,
            cancellationToken);

        return Ok(cases);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CaseDto>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var caseEntity = await _caseService.GetByIdAsync(
            id,
            _currentUser.FirmId,
            cancellationToken);

        if (caseEntity is null)
        {
            return NotFound();
        }

        return Ok(caseEntity);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Lawyer")]
    public async Task<ActionResult<CaseDto>> Create(
        [FromBody] CreateCaseRequest request,
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
                ApiResponse<CaseDto>.FailureResponse(
                    "Validation failed.",
                    errors));
        }

        try
        {
            var caseDto = await _caseService.CreateAsync(
                _currentUser.FirmId,
                request,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = caseDto.Id },
                caseDto);
        }
        catch (ValidationException ex)
        {
            return BadRequest(
                ApiResponse<CaseDto>.FailureResponse(
                    ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                ApiResponse<CaseDto>.FailureResponse(
                    ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(
                ApiResponse<CaseDto>.FailureResponse(
                    ex.Message));
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Lawyer")]
    public async Task<ActionResult<CaseDto>> Update(
        Guid id,
        [FromBody] UpdateCaseRequest request,
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
                ApiResponse<CaseDto>.FailureResponse(
                    "Validation failed.",
                    errors));
        }

        var caseDto = await _caseService.UpdateAsync(
            id,
            _currentUser.FirmId,
            request,
            cancellationToken);

        if (caseDto is null)
        {
            return NotFound();
        }

        return Ok(caseDto);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Lawyer")]
    public async Task<IActionResult> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        var deleted = await _caseService.DeleteAsync(
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