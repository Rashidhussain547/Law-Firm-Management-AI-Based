using System.Security.Claims;
using LegalFlow.Application.Auth.Interfaces;
using Microsoft.AspNetCore.Http;

namespace LegalFlow.Infrastructure.Authentication;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(
        IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid UserId
    {
        get
        {
            var value = _httpContextAccessor
                .HttpContext?
                .User
                .FindFirstValue(ClaimTypes.NameIdentifier);

            return Guid.Parse(value!);
        }
    }

    public Guid FirmId
    {
        get
        {
            var value = _httpContextAccessor
                .HttpContext?
                .User
                .FindFirstValue("firmId");

            return Guid.Parse(value!);
        }
    }

    public string? Email =>
        _httpContextAccessor.HttpContext?
            .User
            .FindFirstValue(ClaimTypes.Email);

    public string? Role =>
        _httpContextAccessor.HttpContext?
            .User
            .FindFirstValue(ClaimTypes.Role);
}