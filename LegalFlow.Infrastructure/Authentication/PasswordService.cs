using Microsoft.AspNetCore.Identity;
using LegalFlow.Application.Auth.Interfaces;

namespace LegalFlow.Infrastructure.Authentication;

public class PasswordService : IPasswordService
{
    private readonly PasswordHasher<object> _passwordHasher = new();

    public string HashPassword(string password)
    {
        return _passwordHasher.HashPassword(
            null!,
            password);
    }

    public bool VerifyPassword(
        string hashedPassword,
        string providedPassword)
    {
        var result = _passwordHasher.VerifyHashedPassword(
            null!,
            hashedPassword,
            providedPassword);

        return result == PasswordVerificationResult.Success ||
               result == PasswordVerificationResult.SuccessRehashNeeded;
    }
}