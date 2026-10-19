using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LegalFlow.Application.Auth.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace LegalFlow.Infrastructure.Authentication;

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(
        Guid userId,
        Guid firmId,
        string email,
        string role,
        string firstName,
        string lastName)
    {
        var key = _configuration["Jwt:Key"]!;

        var issuer = _configuration["Jwt:Issuer"];

        var audience = _configuration["Jwt:Audience"];

        var expiryMinutes = int.Parse(
            _configuration["Jwt:ExpiryMinutes"]!);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId.ToString()),

            new("firmId", firmId.ToString()),

            new(JwtRegisteredClaimNames.Email, email),

            new(ClaimTypes.Role, role),

            new("firstName", firstName),

            new("lastName", lastName)
        };

        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key));

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}