using LegalFlow.Domain.Entities;

namespace LegalFlow.Application.Auth.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsByEmailAsync(
        string email,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        User user,
        CancellationToken cancellationToken = default);

    Task<List<User>> GetActiveUsersByFirmIdAsync(
       Guid firmId,
       CancellationToken cancellationToken = default);

    Task<User?> GetByIdAsync(
    Guid id,
    CancellationToken cancellationToken = default);

    Task UpdateAsync(
        User user,
        CancellationToken cancellationToken = default);

    Task<User?> GetByIdAndFirmIdAsync(
    Guid userId,
    Guid firmId,
    CancellationToken cancellationToken = default);
}