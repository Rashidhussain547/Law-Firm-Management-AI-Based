using LegalFlow.Domain.Entities;

namespace LegalFlow.Application.Clients.Interfaces;

public interface IClientRepository
{
    Task<Client?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<List<Client>> GetAllAsync(
        Guid firmId,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Client client,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        Client client,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Client client,
        CancellationToken cancellationToken = default);
}