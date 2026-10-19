using FluentValidation;
using LegalFlow.Application.Auth.Interfaces;
using LegalFlow.Application.Cases.DTOs;
using LegalFlow.Application.Cases.Interfaces;
using LegalFlow.Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LegalFlow.Api.Controllers;

[ApiController]
[Route("api/cases/{caseId:guid}/tasks")]
[Authorize]
public class CaseTasksController : ControllerBase
{
    private readonly ICaseTaskService _taskService;
    private readonly ICurrentUserService _currentUser;
    private readonly IValidator<CreateTaskRequest> _createValidator;
    private readonly IValidator<UpdateTaskRequest> _updateValidator;

    public CaseTasksController(
        ICaseTaskService taskService,
        ICurrentUserService currentUser,
        IValidator<CreateTaskRequest> createValidator,
        IValidator<UpdateTaskRequest> updateValidator)
    {
        _taskService = taskService;
        _currentUser = currentUser;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<ActionResult<List<TaskDto>>> GetAll(
        Guid caseId,
        CancellationToken cancellationToken)
    {
        var tasks = await _taskService.GetAllAsync(
            caseId,
            _currentUser.FirmId,
            cancellationToken);

        return Ok(tasks);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskDto>> GetById(
        Guid caseId,
        Guid id,
        CancellationToken cancellationToken)
    {
        var task = await _taskService.GetByIdAsync(
            id,
            _currentUser.FirmId,
            cancellationToken);

        if (task is null || task.CaseId != caseId)
        {
            return NotFound();
        }

        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<TaskDto>> Create(
        Guid caseId,
        [FromBody] CreateTaskRequest request,
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
                ApiResponse<TaskDto>.FailureResponse(
                    "Validation failed.",
                    errors));
        }

        var task = await _taskService.CreateAsync(
            caseId,
            _currentUser.FirmId,
            request,
            cancellationToken);

        if (task is null)
        {
            return NotFound();
        }

        return CreatedAtAction(
            nameof(GetById),
            new
            {
                caseId,
                id = task.Id
            },
            task);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TaskDto>> Update(
        Guid caseId,
        Guid id,
        [FromBody] UpdateTaskRequest request,
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
                ApiResponse<TaskDto>.FailureResponse(
                    "Validation failed.",
                    errors));
        }

        var task = await _taskService.UpdateAsync(
            id,
            _currentUser.FirmId,
            request,
            cancellationToken);

        if (task is null || task.CaseId != caseId)
        {
            return NotFound();
        }

        return Ok(task);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        Guid caseId,
        Guid id,
        CancellationToken cancellationToken)
    {
        var task = await _taskService.GetByIdAsync(
            id,
            _currentUser.FirmId,
            cancellationToken);

        if (task is null || task.CaseId != caseId)
        {
            return NotFound();
        }

        var deleted = await _taskService.DeleteAsync(
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