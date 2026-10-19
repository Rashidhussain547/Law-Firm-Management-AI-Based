using LegalFlow.Application.AI.DTOs;

namespace LegalFlow.Application.AI.Interfaces;

public interface IAiCaseService
{
    Task<CaseSummaryDto?> GenerateCaseSummaryAsync(
        Guid caseId,
        Guid firmId,
        CancellationToken cancellationToken = default);

    Task<DocumentAnalysisDto?> AnalyzeDocumentAsync(
        Guid documentId,
        Guid caseId,
        Guid firmId,
        CancellationToken cancellationToken = default);
}