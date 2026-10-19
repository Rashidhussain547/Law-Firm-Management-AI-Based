namespace LegalFlow.Application.Auth.Interfaces;

public interface ICurrentUserService
{
    Guid UserId { get; }

    Guid FirmId { get; }

    string? Email { get; }

    string? Role { get; }
}