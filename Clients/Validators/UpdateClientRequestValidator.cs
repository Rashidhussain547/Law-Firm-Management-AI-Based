using FluentValidation;
using LegalFlow.Application.Clients.DTOs;

namespace LegalFlow.Application.Clients.Validators;

public class UpdateClientRequestValidator
    : AbstractValidator<UpdateClientRequest>
{
    public UpdateClientRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.LastName)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(320);

        RuleFor(x => x.CompanyName)
            .MaximumLength(200);

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(30);

        RuleFor(x => x.Address)
            .MaximumLength(500);
    }
}