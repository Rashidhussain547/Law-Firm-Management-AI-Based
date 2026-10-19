using FluentValidation;
using LegalFlow.Application.Auth.Interfaces;
using LegalFlow.Application.Clients.DTOs;
using LegalFlow.Application.Clients.Interfaces;
using LegalFlow.Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LegalFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientsController : ControllerBase
{
    private readonly IClientService _clientService;
    private readonly IValidator<CreateClientRequest> _createValidator;
    private readonly IValidator<UpdateClientRequest> _updateValidator;
    private readonly ICurrentUserService _currentUser;

    public ClientsController(
        IClientService clientService,
         IValidator<CreateClientRequest> createValidator,
        IValidator<UpdateClientRequest> updateValidator , ICurrentUserService currentUser)
    {
        _clientService = clientService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<ActionResult<List<ClientDto>>> GetAll(
        CancellationToken cancellationToken)
    {
        var clients = await _clientService.GetAllAsync(
            _currentUser.FirmId,
            cancellationToken);

        return Ok(clients);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ClientDto>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var client = await _clientService.GetByIdAsync(
            id,
            cancellationToken);

        if (client is null)
        {
            return NotFound();
        }

        return Ok(client);
    }

    [HttpPost]
    public async Task<ActionResult<ClientDto>> Create(
        [FromBody] CreateClientRequest request,
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
                ApiResponse<ClientDto>.FailureResponse(
                    "Validation failed.",
                    errors));
        }

        var client = await _clientService.CreateAsync(
            _currentUser.FirmId,
            request,
            cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = client.Id },
            client);
    }
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ClientDto>> Update(
        Guid id,
        [FromBody] UpdateClientRequest request,
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
                ApiResponse<ClientDto>.FailureResponse(
                    "Validation failed.",
                    errors));
        }
        var client = await _clientService.UpdateAsync(
            id,
            request,
            cancellationToken);

        if (client is null)
        {
            return NotFound();
        }

        return Ok(client);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        var deleted = await _clientService.DeleteAsync(
            id,
            cancellationToken);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}