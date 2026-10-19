using LegalFlow.Domain.Entities;

namespace LegalFlow.Application.Auth.Interfaces;

public interface IFirmRepository
{
    Task AddAsync(
        Firm firm,
        CancellationToken cancellationToken = default);
}