using LegalFlow.Application.Cases.Interfaces;
using LegalFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LegalFlow.Infrastructure.Persistence.Repositories;

public class CaseHearingRepository : ICaseHearingRepository
{
    private readonly LegalFlowDbContext _dbContext;

    public CaseHearingRepository(LegalFlowDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<CaseHearing>> GetAllByCaseIdAsync(
        Guid caseId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.CaseHearings
            .AsNoTracking()
            .Where(x => x.CaseId == caseId)
            .OrderByDescending(x => x.HearingDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<CaseHearing?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.CaseHearings
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task AddAsync(
        CaseHearing hearing,
        CancellationToken cancellationToken = default)
    {
        _dbContext.CaseHearings.Add(hearing);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(
        CaseHearing hearing,
        CancellationToken cancellationToken = default)
    {
        _dbContext.CaseHearings.Update(hearing);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(
        CaseHearing hearing,
        CancellationToken cancellationToken = default)
    {
        _dbContext.CaseHearings.Remove(hearing);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}