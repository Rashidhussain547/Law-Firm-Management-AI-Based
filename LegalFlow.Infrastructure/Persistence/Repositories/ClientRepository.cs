using LegalFlow.Application.Clients.Interfaces;
using LegalFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LegalFlow.Infrastructure.Persistence.Repositories;

public class ClientRepository : IClientRepository
{
    private readonly LegalFlowDbContext _context;

    public ClientRepository(LegalFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Client?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _context.Clients
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task<List<Client>> GetAllAsync(
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Clients
            .AsNoTracking()
            .Where(x => x.FirmId == firmId)
            .OrderBy(x => x.FirstName)
            .ThenBy(x => x.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(
        Client client,
        CancellationToken cancellationToken = default)
    {
        await _context.Clients.AddAsync(
            client,
            cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(
        Client client,
        CancellationToken cancellationToken = default)
    {
        _context.Clients.Update(client);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(
        Client client,
        CancellationToken cancellationToken = default)
    {
        _context.Clients.Remove(client);

        await _context.SaveChangesAsync(cancellationToken);
    }
}