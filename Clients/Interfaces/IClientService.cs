using LegalFlow.Application.Clients.DTOs;

namespace LegalFlow.Application.Clients.Interfaces;

public interface IClientService
{
    Task<List<ClientDto>> GetAllAsync(
        Guid firmId,
        CancellationToken cancellationToken = default);

    Task<ClientDto?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<ClientDto> CreateAsync(
        Guid firmId,
        CreateClientRequest request,
        CancellationToken cancellationToken = default);

    Task<ClientDto?> UpdateAsync(
        Guid id,
        UpdateClientRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default);
}