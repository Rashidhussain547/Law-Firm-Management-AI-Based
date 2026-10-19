using LegalFlow.Application.AI.Interfaces;
using LegalFlow.Application.AI.Requests;
using LegalFlow.Application.Auth.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LegalFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AiController : ControllerBase
{
    private readonly IAiService _aiService;
    private readonly IAiCaseService _aiCaseService;
    private readonly ICurrentUserService _currentUserService;

    public AiController(
        IAiService aiService,
        IAiCaseService aiCaseService,
        ICurrentUserService currentUserService)
    {
        _aiService = aiService;
        _aiCaseService = aiCaseService;
        _currentUserService = currentUserService;
    }

    [HttpPost("test")]
    public async Task<IActionResult> Test(
        [FromBody] AiTestRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
        {
            return BadRequest(new
            {
                success = false,
                message = "Prompt is required.",
                data = (object?)null
            });
        }

        var result = await _aiService.GenerateTextAsync(
            request.Prompt,
            cancellationToken);

        return Ok(new
        {
            success = true,
            message = "AI response generated successfully.",
            data = result
        });
    }

    [HttpGet("cases/{caseId:guid}/summary")]
    public async Task<IActionResult> GenerateCaseSummary(
        Guid caseId,
        CancellationToken cancellationToken)
    {
        var firmId = _currentUserService.FirmId;

        var result = await _aiCaseService.GenerateCaseSummaryAsync(
            caseId,
            firmId,
            cancellationToken);

        if (result == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Case not found.",
                data = (object?)null
            });
        }

        return Ok(new
        {
            success = true,
            message = "AI case summary generated successfully.",
            data = result
        });
    }

    [HttpPost("cases/{caseId}/documents/{documentId}/analyze")]
    public async Task<IActionResult> AnalyzeDocument(
    Guid caseId,
    Guid documentId,
    CancellationToken cancellationToken)
    {
        var firmId = _currentUserService.FirmId;

        var result =
            await _aiCaseService.AnalyzeDocumentAsync(
                documentId,
                caseId,
                firmId,
                cancellationToken);

        if (result == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Document not found.",
                data = (object?)null
            });
        }

        return Ok(new
        {
            success = true,
            message = "AI document analysis generated successfully.",
            data = result
        });
    }
}