using LegalFlow.Application.Cases.Interfaces;
using LegalFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LegalFlow.Infrastructure.Persistence.Repositories;

public class CaseNoteRepository : ICaseNoteRepository
{
    private readonly LegalFlowDbContext _dbContext;

    public CaseNoteRepository(LegalFlowDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<CaseNote>> GetAllByCaseIdAsync(
        Guid caseId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.CaseNotes
            .AsNoTracking()
            .Where(x => x.CaseId == caseId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<CaseNote?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.CaseNotes
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task AddAsync(
        CaseNote note,
        CancellationToken cancellationToken = default)
    {
        _dbContext.CaseNotes.Add(note);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(
        CaseNote note,
        CancellationToken cancellationToken = default)
    {
        _dbContext.CaseNotes.Update(note);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(
        CaseNote note,
        CancellationToken cancellationToken = default)
    {
        _dbContext.CaseNotes.Remove(note);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}