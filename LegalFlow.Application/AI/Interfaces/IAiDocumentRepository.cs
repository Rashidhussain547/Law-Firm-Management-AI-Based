using LegalFlow.Application.AI.Models;

namespace LegalFlow.Application.AI.Interfaces;

public interface IAiDocumentRepository
{
    Task<AiDocumentContext?> GetDocumentContextAsync(
        Guid documentId,
        Guid caseId,
        Guid firmId,
        CancellationToken cancellationToken = default);

    Task UpdateAiAnalysisAsync(
        Guid documentId,
        string aiSummary,
        CancellationToken cancellationToken = default);
}