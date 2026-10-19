using LegalFlow.Application.Auth.DTOs;

namespace LegalFlow.Application.Auth.Interfaces;

public interface IAuthService
{
    Task RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken = default);

    Task<LoginResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default);

    Task<List<UserDto>> GetFirmUsersAsync(
       Guid firmId,
       CancellationToken cancellationToken = default);
    Task ChangePasswordAsync(
       Guid userId,
       ChangePasswordRequest request,
       CancellationToken cancellationToken = default);

    Task UpdateProfileAsync(
    Guid userId,
    UpdateProfileRequest request,
    CancellationToken cancellationToken = default);

    Task CreateFirmUserAsync(
    Guid firmId,
    CreateUserRequest request,
    CancellationToken cancellationToken = default);

    Task<UserDto> GetCurrentUserAsync(
    Guid userId,
    CancellationToken cancellationToken = default);
}