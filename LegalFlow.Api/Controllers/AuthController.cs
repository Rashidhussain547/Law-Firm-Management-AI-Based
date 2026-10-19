using FluentValidation;
using LegalFlow.Application.Auth.DTOs;
using LegalFlow.Application.Auth.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace LegalFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IValidator<RegisterRequest> _registerValidator;
    private readonly ICurrentUserService _currentUser;
    private readonly IValidator<ChangePasswordRequest> _changePasswordValidator;
    private readonly IValidator<UpdateProfileRequest> _updateProfileValidator;
    private readonly IValidator<CreateUserRequest> _createUserValidator;

    public AuthController(
        IAuthService authService,
        IValidator<RegisterRequest> registerValidator,
        ICurrentUserService currentUser,
        IValidator<ChangePasswordRequest> changePasswordValidator,
        IValidator<UpdateProfileRequest> updateProfileValidator, 
        IValidator<CreateUserRequest> createUserValidator)
    {
        _authService = authService;
        _registerValidator = registerValidator;
        _currentUser = currentUser;
        _changePasswordValidator = changePasswordValidator;
        _updateProfileValidator = updateProfileValidator;
        _createUserValidator = createUserValidator;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult =
            await _registerValidator.ValidateAsync(
                request,
                cancellationToken);

        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(x => x.PropertyName)
                .ToDictionary(
                    x => char.ToLowerInvariant(x.Key[0]) + x.Key[1..],
                    x => x.Select(e => e.ErrorMessage).ToArray());

            return BadRequest(
                new
                {
                    success = false,
                    message = "Validation failed.",
                    data = (object?)null,
                    errors
                });
        }

        await _authService.RegisterAsync(
            request,
            cancellationToken);

        return StatusCode(
            StatusCodes.Status201Created,
            new
            {
                success = true,
                message = "User registered successfully."
            });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
    [FromBody] LoginRequest request,
    CancellationToken cancellationToken)
    {
        var response = await _authService.LoginAsync(
            request,
            cancellationToken);

        return Ok(new
        {
            success = true,
            message = "Login successful.",
            data = response
        });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser(
      CancellationToken cancellationToken)
    {
        var userIdValue =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user identity.",
                data = (object?)null
            });
        }

        var user = await _authService.GetCurrentUserAsync(
            userId,
            cancellationToken);

        return Ok(new
        {
            success = true,
            message = "Current user retrieved successfully.",
            data = new
            {
                userId = user.Id,
                firmId = _currentUser.FirmId,
                email = user.Email,
                firstName = user.FirstName,
                lastName = user.LastName,
                role = user.Role
            }
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("admin-only")]
    public IActionResult AdminOnly()
    {
        return Ok(new
        {
            success = true,
            message = "You have Admin access."
        });
    }

    [Authorize]
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
    CancellationToken cancellationToken)
    {
        var users = await _authService.GetFirmUsersAsync(
            _currentUser.FirmId,
            cancellationToken);

        return Ok(new
        {
            success = true,
            message = "Firm users retrieved successfully.",
            data = users
        });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(
    [FromBody] ChangePasswordRequest request,
    CancellationToken cancellationToken)
    {
        var validationResult =
            await _changePasswordValidator.ValidateAsync(
                request,
                cancellationToken);

        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(x => x.PropertyName)
                .ToDictionary(
                    x => char.ToLowerInvariant(x.Key[0]) +
                         x.Key[1..],
                    x => x.Select(e => e.ErrorMessage).ToArray());

            return BadRequest(
                new
                {
                    success = false,
                    message = "Validation failed.",
                    data = (object?)null,
                    errors
                });
        }

        await _authService.ChangePasswordAsync(
            _currentUser.UserId,
            request,
            cancellationToken);

        return Ok(
            new
            {
                success = true,
                message = "Password changed successfully."
            });
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(
    [FromBody] UpdateProfileRequest request,
    CancellationToken cancellationToken)
    {
        var validationResult =
            await _updateProfileValidator.ValidateAsync(
                request,
                cancellationToken);

        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(x => x.PropertyName)
                .ToDictionary(
                    x => char.ToLowerInvariant(x.Key[0]) + x.Key[1..],
                    x => x.Select(e => e.ErrorMessage).ToArray());

            return BadRequest(
                new
                {
                    success = false,
                    message = "Validation failed.",
                    data = (object?)null,
                    errors
                });
        }

        await _authService.UpdateProfileAsync(
            _currentUser.UserId,
            request,
            cancellationToken);

        return Ok(new
        {
            success = true,
            message = "Profile updated successfully."
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("users")]
    public async Task<IActionResult> CreateUser(
    [FromBody] CreateUserRequest request,
    CancellationToken cancellationToken)
    {
        var validationResult =
            await _createUserValidator.ValidateAsync(
                request,
                cancellationToken);

        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(x => x.PropertyName)
                .ToDictionary(
                    x => char.ToLowerInvariant(x.Key[0]) + x.Key[1..],
                    x => x.Select(e => e.ErrorMessage).ToArray());

            return BadRequest(
                new
                {
                    success = false,
                    message = "Validation failed.",
                    data = (object?)null,
                    errors
                });
        }

        await _authService.CreateFirmUserAsync(
            _currentUser.FirmId,
            request,
            cancellationToken);

        return StatusCode(
            StatusCodes.Status201Created,
            new
            {
                success = true,
                message = "User created successfully."
            });
    }

}