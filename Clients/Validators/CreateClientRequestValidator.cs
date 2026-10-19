using FluentValidation;
using LegalFlow.Application.Clients.DTOs;

namespace LegalFlow.Application.Clients.Validators;

public class CreateClientRequestValidator
    : AbstractValidator<CreateClientRequest>
{
    public CreateClientRequestValidator()
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
            .WithMessage("Please provide a valid email address.")
            .MaximumLength(320)
            .WithMessage("Email cannot exceed 320 characters.");

        RuleFor(x => x.CompanyName)
            .MaximumLength(200)
            .WithMessage("Company name cannot exceed 200 characters.");

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(30)
            .WithMessage("Phone number cannot exceed 30 characters.");

        RuleFor(x => x.Address)
            .MaximumLength(500)
            .WithMessage("Address cannot exceed 500 characters.");
    }
}