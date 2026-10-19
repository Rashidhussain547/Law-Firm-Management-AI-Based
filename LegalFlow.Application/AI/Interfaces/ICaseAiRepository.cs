using LegalFlow.Application.AI.Models;

namespace LegalFlow.Application.AI.Interfaces;

public interface ICaseAiRepository
{
    Task<CaseAiContext?> GetCaseContextAsync(
        Guid caseId,
        Guid firmId,
        CancellationToken cancellationToken = default);
}