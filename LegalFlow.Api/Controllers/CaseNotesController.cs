using FluentValidation;
using LegalFlow.Application.Auth.Interfaces;
using LegalFlow.Application.Cases.DTOs;
using LegalFlow.Application.Cases.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LegalFlow.Api.Controllers;

[ApiController]
[Route("api/cases/{caseId:guid}/notes")]
[Authorize]
public class CaseNotesController : ControllerBase
{
    private readonly ICaseNoteService _noteService;
    private readonly ICurrentUserService _currentUser;
    private readonly IValidator<CreateCaseNoteRequest> _createValidator;
    private readonly IValidator<UpdateCaseNoteRequest> _updateValidator;

    public CaseNotesController(
        ICaseNoteService noteService,
        ICurrentUserService currentUser,
        IValidator<CreateCaseNoteRequest> createValidator,
        IValidator<UpdateCaseNoteRequest> updateValidator)
    {
        _noteService = noteService;
        _currentUser = currentUser;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<ActionResult<List<CaseNoteDto>>> GetAll(
        Guid caseId,
        CancellationToken cancellationToken)
    {
        var notes = await _noteService.GetAllAsync(
            caseId,
            _currentUser.FirmId,
            cancellationToken);

        return Ok(notes);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CaseNoteDto>> GetById(
        Guid caseId,
        Guid id,
        CancellationToken cancellationToken)
    {
        var note = await _noteService.GetByIdAsync(
            id,
            _currentUser.FirmId,
            cancellationToken);

        if (note is null || note.CaseId != caseId)
        {
            return NotFound();
        }

        return Ok(note);
    }

    [HttpPost]
    public async Task<ActionResult<CaseNoteDto>> Create(
        Guid caseId,
        [FromBody] CreateCaseNoteRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await _createValidator.ValidateAsync(
            request,
            cancellationToken);

        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var note = await _noteService.CreateAsync(
            caseId,
            _currentUser.FirmId,
            _currentUser.UserId,
            request,
            cancellationToken);

        if (note is null)
        {
            return NotFound();
        }

        return CreatedAtAction(
            nameof(GetById),
            new
            {
                caseId,
                id = note.Id
            },
            note);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CaseNoteDto>> Update(
        Guid caseId,
        Guid id,
        [FromBody] UpdateCaseNoteRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await _updateValidator.ValidateAsync(
            request,
            cancellationToken);

        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        var note = await _noteService.UpdateAsync(
            id,
            _currentUser.FirmId,
            request,
            cancellationToken);

        if (note is null || note.CaseId != caseId)
        {
            return NotFound();
        }

        return Ok(note);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        Guid caseId,
        Guid id,
        CancellationToken cancellationToken)
    {
        var note = await _noteService.GetByIdAsync(
            id,
            _currentUser.FirmId,
            cancellationToken);

        if (note is null || note.CaseId != caseId)
        {
            return NotFound();
        }

        var deleted = await _noteService.DeleteAsync(
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