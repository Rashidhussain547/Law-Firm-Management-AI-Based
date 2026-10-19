using FluentValidation;
using LegalFlow.Application.Auth.Interfaces;
using LegalFlow.Application.Cases.DTOs;
using LegalFlow.Application.Cases.Interfaces;
using LegalFlow.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LegalFlow.Api.Controllers;

[ApiController]
[Route("api/cases/{caseId:guid}/documents")]
[Authorize]
public class CaseDocumentsController : ControllerBase
{
    private readonly ICaseDocumentService _documentService;
    private readonly ICurrentUserService _currentUser;
    private readonly IValidator<UploadDocumentRequest> _validator;

    private static readonly Dictionary<string, string> AllowedFileTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            [".pdf"] = "application/pdf",
            [".doc"] = "application/msword",
            [".docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            [".txt"] = "text/plain",
            [".xls"] = "application/vnd.ms-excel",
            [".xlsx"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            [".jpg"] = "image/jpeg",
            [".jpeg"] = "image/jpeg",
            [".png"] = "image/png"
        };

    private const long MaxFileSize = 10 * 1024 * 1024;

    public CaseDocumentsController(
        ICaseDocumentService documentService,
        ICurrentUserService currentUser,
        IValidator<UploadDocumentRequest> validator)
    {
        _documentService = documentService;
        _currentUser = currentUser;
        _validator = validator;
    }

    [HttpGet]
    public async Task<ActionResult<List<DocumentDto>>> GetAll(
        Guid caseId,
        CancellationToken cancellationToken)
    {
        var documents = await _documentService.GetAllAsync(
            caseId,
            _currentUser.FirmId,
            cancellationToken);

        return Ok(documents);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DocumentDto>> GetById(
        Guid caseId,
        Guid id,
        CancellationToken cancellationToken)
    {
        var document = await _documentService.GetByIdAsync(
            id,
            _currentUser.FirmId,
            cancellationToken);

        if (document is null || document.CaseId != caseId)
        {
            return NotFound();
        }

        return Ok(document);
    }

    [HttpPost]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<ActionResult<DocumentDto>> Upload(
        Guid caseId,
        IFormFile file,
        [FromForm] DocumentType type,
        [FromForm] string? description,
        CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest("File is required.");
        }

        if (file.Length > MaxFileSize)
        {
            return BadRequest("File size must be 10 MB or less.");
        }

        var extension = Path.GetExtension(file.FileName);

        if (!AllowedFileTypes.ContainsKey(extension))
        {
            return BadRequest(
                "Unsupported file type. Allowed types: PDF, DOC, DOCX, TXT, XLS, XLSX, JPG, JPEG, PNG.");
        }

        var request = new UploadDocumentRequest
        {
            FileName = Path.GetFileName(file.FileName),
            ContentType = file.ContentType,
            FileSize = file.Length,
            Type = type,
            Description = description
        };

        var validationResult = await _validator.ValidateAsync(
            request,
            cancellationToken);

        if (!validationResult.IsValid)
        {
            return BadRequest(validationResult.Errors);
        }

        await using var stream = file.OpenReadStream();

        var document = await _documentService.UploadAsync(
            caseId,
            _currentUser.FirmId,
            _currentUser.UserId,
            stream,
            Path.GetFileName(file.FileName),
            file.ContentType,
            file.Length,
            request,
            cancellationToken);

        if (document is null)
        {
            return NotFound();
        }

        return Ok(document);
    }

    [HttpGet("{id:guid}/download")]
    public async Task<IActionResult> Download(
        Guid caseId,
        Guid id,
        CancellationToken cancellationToken)
    {
        var document = await _documentService.GetByIdAsync(
            id,
            _currentUser.FirmId,
            cancellationToken);

        if (document is null || document.CaseId != caseId)
        {
            return NotFound();
        }

        var file = await _documentService.GetFileAsync(
            id,
            _currentUser.FirmId,
            cancellationToken);

        if (file is null)
        {
            return NotFound();
        }

        return File(
            file.Stream,
            file.ContentType,
            file.FileName);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        Guid caseId,
        Guid id,
        CancellationToken cancellationToken)
    {
        var document = await _documentService.GetByIdAsync(
            id,
            _currentUser.FirmId,
            cancellationToken);

        if (document is null || document.CaseId != caseId)
        {
            return NotFound();
        }

        var deleted = await _documentService.DeleteAsync(
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