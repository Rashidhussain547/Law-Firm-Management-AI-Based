using LegalFlow.Application.Cases.Interfaces;
using LegalFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LegalFlow.Infrastructure.Persistence.Repositories;

public class CaseTaskRepository : ICaseTaskRepository
{
    private readonly LegalFlowDbContext _dbContext;

    public CaseTaskRepository(LegalFlowDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<CaseTask>> GetAllByCaseIdAsync(
        Guid caseId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.CaseTasks
            .AsNoTracking()
            .Where(x => x.CaseId == caseId)
            .OrderBy(x => x.DueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<CaseTask?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.CaseTasks
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task AddAsync(
        CaseTask task,
        CancellationToken cancellationToken = default)
    {
        _dbContext.CaseTasks.Add(task);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(
        CaseTask task,
        CancellationToken cancellationToken = default)
    {
        _dbContext.CaseTasks.Update(task);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(
        CaseTask task,
        CancellationToken cancellationToken = default)
    {
        _dbContext.CaseTasks.Remove(task);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}