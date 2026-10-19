using LegalFlow.Application.Clients.DTOs;
using LegalFlow.Application.Clients.Interfaces;
using LegalFlow.Domain.Entities;

namespace LegalFlow.Application.Clients.Services;

public class ClientService : IClientService
{
    private readonly IClientRepository _clientRepository;

    public ClientService(IClientRepository clientRepository)
    {
        _clientRepository = clientRepository;
    }

    public async Task<List<ClientDto>> GetAllAsync(
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        var clients = await _clientRepository.GetAllAsync(
            firmId,
            cancellationToken);

        return clients.Select(MapToDto).ToList();
    }

    public async Task<ClientDto?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var client = await _clientRepository.GetByIdAsync(
            id,
            cancellationToken);

        return client is null ? null : MapToDto(client);
    }

    public async Task<ClientDto> CreateAsync(
        Guid firmId,
        CreateClientRequest request,
        CancellationToken cancellationToken = default)
    {
        var client = new Client
        {
            Id = Guid.NewGuid(),
            FirmId = firmId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            CompanyName = request.CompanyName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            Address = request.Address,
            IsActive = true
        };

        await _clientRepository.AddAsync(
            client,
            cancellationToken);

        return MapToDto(client);
    }

    public async Task<ClientDto?> UpdateAsync(
        Guid id,
        UpdateClientRequest request,
        CancellationToken cancellationToken = default)
    {
        var client = await _clientRepository.GetByIdAsync(
            id,
            cancellationToken);

        if (client is null)
        {
            return null;
        }

        client.FirstName = request.FirstName;
        client.LastName = request.LastName;
        client.CompanyName = request.CompanyName;
        client.Email = request.Email;
        client.PhoneNumber = request.PhoneNumber;
        client.Address = request.Address;
        client.IsActive = request.IsActive;
        client.UpdatedAt = DateTime.UtcNow;

        await _clientRepository.UpdateAsync(
            client,
            cancellationToken);

        return MapToDto(client);
    }

    public async Task<bool> DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var client = await _clientRepository.GetByIdAsync(
            id,
            cancellationToken);

        if (client is null)
        {
            return false;
        }

        await _clientRepository.DeleteAsync(
            client,
            cancellationToken);

        return true;
    }

    private static ClientDto MapToDto(Client client)
    {
        return new ClientDto
        {
            Id = client.Id,
            FirstName = client.FirstName,
            LastName = client.LastName,
            CompanyName = client.CompanyName,
            Email = client.Email,
            PhoneNumber = client.PhoneNumber,
            Address = client.Address,
            IsActive = client.IsActive
        };
    }
}