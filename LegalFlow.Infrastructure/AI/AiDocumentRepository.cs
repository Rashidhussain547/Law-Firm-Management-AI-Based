using LegalFlow.Application.AI.Interfaces;
using LegalFlow.Application.AI.Models;
using LegalFlow.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LegalFlow.Infrastructure.AI;

public class AiDocumentRepository : IAiDocumentRepository
{
    private readonly LegalFlowDbContext _dbContext;

    public AiDocumentRepository(
        LegalFlowDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AiDocumentContext?> GetDocumentContextAsync(
        Guid documentId,
        Guid caseId,
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        var result = await _dbContext.CaseDocuments
            .Where(d =>
                d.Id == documentId &&
                d.CaseId == caseId &&
                d.Case.FirmId == firmId)
            .Select(d => new AiDocumentContext
            {
                DocumentId = d.Id,
                CaseId = d.CaseId,
                FileName = d.FileName,
                OriginalFileName = d.OriginalFileName,
                StoragePath = d.StoragePath,
                ContentType = d.ContentType,
                DocumentType = d.Type.ToString(),
                Description = d.Description,
                CaseNumber = d.Case.CaseNumber,
                CaseTitle = d.Case.Title
            })
            .FirstOrDefaultAsync(cancellationToken);

        return result;
    }

    public async Task UpdateAiAnalysisAsync(
        Guid documentId,
        string aiSummary,
        CancellationToken cancellationToken = default)
    {
        var document = await _dbContext.CaseDocuments
            .FirstOrDefaultAsync(
                d => d.Id == documentId,
                cancellationToken);

        if (document == null)
        {
            throw new InvalidOperationException(
                "Document not found.");
        }

        document.IsAiProcessed = true;
        document.AiSummary = aiSummary;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}