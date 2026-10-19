using FluentValidation;
using LegalFlow.Application.Auth.DTOs;
using LegalFlow.Application.Auth.Interfaces;
using LegalFlow.Domain.Entities;

namespace LegalFlow.Application.Auth.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IFirmRepository _firmRepository;
    private readonly IPasswordService _passwordService;
    private readonly IJwtService _jwtService;

    public AuthService(
        IUserRepository userRepository,
        IFirmRepository firmRepository,
        IPasswordService passwordService,
        IJwtService jwtService)
    {
        _userRepository = userRepository;
        _firmRepository = firmRepository;
        _passwordService = passwordService;
        _jwtService = jwtService;
    }

    public async Task RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken = default)
    {
        var emailExists = await _userRepository.ExistsByEmailAsync(
            request.Email,
            cancellationToken);

        if (emailExists)
        {
            throw new ValidationException(
                "A user with this email already exists.");
        }

        var firm = new Firm
        {
            Id = Guid.NewGuid(),
            Name = request.FirmName,
            IsActive = true
        };

        await _firmRepository.AddAsync(
            firm,
            cancellationToken);

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirmId = firm.Id,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = _passwordService.HashPassword(
                request.Password),
            Role = "Admin",
            IsActive = true
        };

        await _userRepository.AddAsync(
            user,
            cancellationToken);
    }

    public async Task<LoginResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByEmailAsync(
            request.Email,
            cancellationToken);

        if (user is null)
        {
            throw new ValidationException(
                "Invalid email or password.");
        }

        if (!user.IsActive)
        {
            throw new ValidationException(
                "User account is inactive.");
        }

        var passwordValid = _passwordService.VerifyPassword(
            user.PasswordHash,
            request.Password);

        if (!passwordValid)
        {
            throw new ValidationException(
                "Invalid email or password.");
        }

        var token = _jwtService.GenerateToken(
            user.Id,
            user.FirmId,
            user.Email,
            user.Role,
            user.FirstName,
            user.LastName);

        return new LoginResponse
        {
            Token = token,
            UserId = user.Id,
            FirmId = user.FirmId,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role
        };
    }

    public async Task<List<UserDto>> GetFirmUsersAsync(
    Guid firmId,
    CancellationToken cancellationToken = default)
    {
        var users = await _userRepository.GetActiveUsersByFirmIdAsync(
            firmId,
            cancellationToken);

        return users
            .Select(user => new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role,
                IsActive = user.IsActive,
                ReportsToUserId = user.ReportsToUserId
            })
            .ToList();
    }

    public async Task ChangePasswordAsync(
    Guid userId,
    ChangePasswordRequest request,
    CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(
            userId,
            cancellationToken);

        if (user is null)
        {
            throw new ValidationException(
                "User not found.");
        }

        if (!user.IsActive)
        {
            throw new ValidationException(
                "User account is inactive.");
        }

        var currentPasswordValid =
            _passwordService.VerifyPassword(
                user.PasswordHash,
                request.CurrentPassword);

        if (!currentPasswordValid)
        {
            throw new ValidationException(
                "Current password is incorrect.");
        }

        user.PasswordHash =
            _passwordService.HashPassword(
                request.NewPassword);

        await _userRepository.UpdateAsync(
            user,
            cancellationToken);
    }

    public async Task UpdateProfileAsync(
    Guid userId,
    UpdateProfileRequest request,
    CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(
            userId,
            cancellationToken);

        if (user is null)
        {
            throw new ValidationException(
                "User not found.");
        }

        if (!user.IsActive)
        {
            throw new ValidationException(
                "User account is inactive.");
        }

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();

        await _userRepository.UpdateAsync(
            user,
            cancellationToken);
    }


    public async Task CreateFirmUserAsync(
     Guid firmId,
     CreateUserRequest request,
     CancellationToken cancellationToken = default)
    {
        var emailExists =
            await _userRepository.ExistsByEmailAsync(
                request.Email,
                cancellationToken);

        if (emailExists)
        {
            throw new ValidationException(
                "A user with this email already exists.");
        }

        var role = request.Role.Trim();

        if (!string.Equals(role, "Lawyer", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(role, "Assistant", StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationException(
                "Only Lawyer or Assistant roles are allowed.");
        }

        Guid? reportsToUserId = null;

        if (string.Equals(
                role,
                "Assistant",
                StringComparison.OrdinalIgnoreCase))
        {
            if (!request.ReportsToUserId.HasValue)
            {
                throw new ValidationException(
                    "Assistant must be assigned to a lawyer.");
            }

            var lawyer = await _userRepository.GetByIdAndFirmIdAsync(
                request.ReportsToUserId.Value,
                firmId,
                cancellationToken);

            if (lawyer is null)
            {
                throw new ValidationException(
                    "Selected lawyer was not found.");
            }

            if (!lawyer.IsActive)
            {
                throw new ValidationException(
                    "Selected lawyer is inactive.");
            }

            if (!string.Equals(
                    lawyer.Role,
                    "Lawyer",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new ValidationException(
                    "Assistant can only be assigned to a lawyer.");
            }

            reportsToUserId = lawyer.Id;
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirmId = firmId,

            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = request.Email.Trim(),

            PasswordHash = _passwordService.HashPassword(
                request.Password),

            Role = role,
            IsActive = true,

            ReportsToUserId = reportsToUserId
        };

        await _userRepository.AddAsync(
            user,
            cancellationToken);
    }

    public async Task<UserDto> GetCurrentUserAsync(
    Guid userId,
    CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(
            userId,
            cancellationToken);

        if (user is null)
        {
            throw new ValidationException("User not found.");
        }

        if (!user.IsActive)
        {
            throw new ValidationException("User account is inactive.");
        }

        return new UserDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive
        };
    }
}