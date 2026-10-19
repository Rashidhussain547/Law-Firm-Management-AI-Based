using FluentValidation;
using LegalFlow.Application.Auth.DTOs;

namespace LegalFlow.Application.Auth.Validators;

public class UpdateProfileRequestValidator
    : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileRequestValidator()
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
    }
}