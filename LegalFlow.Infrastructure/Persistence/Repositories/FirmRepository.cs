using LegalFlow.Application.Auth.Interfaces;
using LegalFlow.Domain.Entities;

namespace LegalFlow.Infrastructure.Persistence.Repositories;

public class FirmRepository : IFirmRepository
{
    private readonly LegalFlowDbContext _dbContext;

    public FirmRepository(LegalFlowDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(
        Firm firm,
        CancellationToken cancellationToken = default)
    {
        _dbContext.Firms.Add(firm);

        await _dbContext.SaveChangesAsync(
            cancellationToken);
    }
}