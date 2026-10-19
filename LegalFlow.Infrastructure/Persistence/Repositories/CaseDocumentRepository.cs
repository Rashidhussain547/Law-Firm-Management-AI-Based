using LegalFlow.Application.Cases.Interfaces;
using LegalFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LegalFlow.Infrastructure.Persistence.Repositories;

public class CaseDocumentRepository : ICaseDocumentRepository
{
    private readonly LegalFlowDbContext _dbContext;

    public CaseDocumentRepository(LegalFlowDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<CaseDocument>> GetAllByCaseIdAsync(
        Guid caseId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.CaseDocuments
            .AsNoTracking()
            .Where(x => x.CaseId == caseId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<CaseDocument?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.CaseDocuments
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task AddAsync(
        CaseDocument document,
        CancellationToken cancellationToken = default)
    {
        _dbContext.CaseDocuments.Add(document);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(
        CaseDocument document,
        CancellationToken cancellationToken = default)
    {
        _dbContext.CaseDocuments.Update(document);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(
        CaseDocument document,
        CancellationToken cancellationToken = default)
    {
        _dbContext.CaseDocuments.Remove(document);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}