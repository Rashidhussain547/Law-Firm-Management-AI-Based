namespace LegalFlow.Application.Auth.Interfaces;

public interface IJwtService
{
    string GenerateToken(
        Guid userId,
        Guid firmId,
        string email,
        string role,
        string firstName,
        string lastName);
}