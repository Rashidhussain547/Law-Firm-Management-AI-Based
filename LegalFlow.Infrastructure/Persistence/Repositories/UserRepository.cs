using LegalFlow.Application.Auth.Interfaces;
using LegalFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using static Microsoft.AspNetCore.Hosting.Internal.HostingApplication;

namespace LegalFlow.Infrastructure.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly LegalFlowDbContext _dbContext;

    public UserRepository(LegalFlowDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<User?> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users
            .FirstOrDefaultAsync(
                x => x.Email == email,
                cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(
        string email,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users
            .AnyAsync(
                x => x.Email == email,
                cancellationToken);
    }

    public async Task AddAsync(
        User user,
        CancellationToken cancellationToken = default)
    {
        _dbContext.Users.Add(user);

        await _dbContext.SaveChangesAsync(
            cancellationToken);
    }

    public async Task<List<User>> GetActiveUsersByFirmIdAsync(
    Guid firmId,
    CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users
            .AsNoTracking()
            .Where(x =>
                x.FirmId == firmId &&
                x.IsActive)
            .OrderBy(x => x.FirstName)
            .ThenBy(x => x.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<User?> GetByIdAsync(
    Guid id,
    CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task UpdateAsync(
        User user,
        CancellationToken cancellationToken = default)
    {
        _dbContext.Users.Update(user);

        await _dbContext.SaveChangesAsync(
            cancellationToken);
    }

    public async Task<User?> GetByIdAndFirmIdAsync(
    Guid userId,
    Guid firmId,
    CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users
            .FirstOrDefaultAsync(
                x =>
                    x.Id == userId &&
                    x.FirmId == firmId,
                cancellationToken);
    }
}