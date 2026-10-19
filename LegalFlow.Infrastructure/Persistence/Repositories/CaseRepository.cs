using LegalFlow.Application.Cases.Interfaces;
using LegalFlow.Domain.Entities;
using LegalFlow.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace LegalFlow.Infrastructure.Persistence.Repositories;

public class CaseRepository : ICaseRepository
{
    private readonly LegalFlowDbContext _dbContext;

    public CaseRepository(LegalFlowDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<Case>> GetAllAsync(
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Cases
     .AsNoTracking()
     .Include(x => x.AssignedLawyer)
     .Include(x => x.AssignedAssistant)
     .Where(x => x.FirmId == firmId)
     .OrderByDescending(x => x.OpenedDate)
     .ToListAsync(cancellationToken);
    }

    public async Task<Case?> GetByIdAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Cases
     .Include(x => x.AssignedLawyer)
     .Include(x => x.AssignedAssistant)
     .FirstOrDefaultAsync(
         x => x.Id == id && x.FirmId == firmId,
         cancellationToken);
    }

    public async Task<bool> ExistsByCaseNumberAsync(
        Guid firmId,
        string caseNumber,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Cases
            .AnyAsync(
                x => x.FirmId == firmId &&
                     x.CaseNumber == caseNumber,
                cancellationToken);
    }

    public async Task AddAsync(
        Case caseEntity,
        CancellationToken cancellationToken = default)
    {
        _dbContext.Cases.Add(caseEntity);

        await _dbContext.SaveChangesAsync(
            cancellationToken);
    }

    public async Task UpdateAsync(
        Case caseEntity,
        CancellationToken cancellationToken = default)
    {
        _dbContext.Cases.Update(caseEntity);

        await _dbContext.SaveChangesAsync(
            cancellationToken);
    }

    public async Task DeleteAsync(
        Case caseEntity,
        CancellationToken cancellationToken = default)
    {
        _dbContext.Cases.Remove(caseEntity);

        await _dbContext.SaveChangesAsync(
            cancellationToken);
    }

    public async Task<User?> GetUserByIdAndFirmIdAsync(
    Guid userId,
    Guid firmId,
    CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users
            .FirstOrDefaultAsync(
                x => x.Id == userId &&
                     x.FirmId == firmId,
                cancellationToken);
    }

    public async Task<List<User>> GetAssistantsByLawyerIdAsync(
    Guid lawyerId,
    Guid firmId,
    CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users
            .Where(x =>
                x.FirmId == firmId &&
                x.ReportsToUserId == lawyerId &&
                x.Role == (UserRole.Assistant).ToString() &&
                x.IsActive)
            .OrderBy(x => x.FirstName)
            .ThenBy(x => x.LastName)
            .ToListAsync(cancellationToken);
    }
}