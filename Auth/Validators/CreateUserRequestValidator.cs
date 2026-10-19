using FluentValidation;
using LegalFlow.Application.Auth.DTOs;

namespace LegalFlow.Application.Auth.Validators;

public class CreateUserRequestValidator
    : AbstractValidator<CreateUserRequest>
{
    private static readonly string[] AllowedRoles =
    {
        "Lawyer",
        "Assistant"
    };

    public CreateUserRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty()
            .WithMessage("First name is required.")
            .MaximumLength(100)
            .WithMessage("First name cannot exceed 100 characters.");

        RuleFor(x => x.LastName)
            .NotEmpty()
            .WithMessage("Last name is required.")
            .MaximumLength(100)
            .WithMessage("Last name cannot exceed 100 characters.");

        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("Email is required.")
            .EmailAddress()
            .WithMessage("A valid email address is required.")
            .MaximumLength(200)
            .WithMessage("Email cannot exceed 200 characters.");

        RuleFor(x => x.Password)
            .NotEmpty()
            .WithMessage("Password is required.")
            .MinimumLength(8)
            .WithMessage("Password must be at least 8 characters.");

        RuleFor(x => x.Role)
            .NotEmpty()
            .WithMessage("Role is required.")
            .Must(role =>
                AllowedRoles.Any(x =>
                    string.Equals(
                        x,
                        role,
                        StringComparison.OrdinalIgnoreCase)))
            .WithMessage("Only Lawyer or Assistant roles are allowed.");

        RuleFor(x => x)
            .Must(x =>
            {
                if (string.Equals(
                        x.Role,
                        "Assistant",
                        StringComparison.OrdinalIgnoreCase))
                {
                    return x.ReportsToUserId.HasValue;
                }

                return true;
            })
            .WithMessage(
                "Assistant must be assigned to a lawyer.");
    }
}