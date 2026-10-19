using FluentValidation;
using LegalFlow.Application.Cases.DTOs;

namespace LegalFlow.Application.Cases.Validators;

public class UpdateCaseRequestValidator
    : AbstractValidator<UpdateCaseRequest>
{
    public UpdateCaseRequestValidator()
    {
        RuleFor(x => x.ClientId)
            .NotEmpty()
            .WithMessage("Client is required.");

        RuleFor(x => x.CaseNumber)
            .NotEmpty()
            .WithMessage("Case number is required.")
            .MaximumLength(50);

        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Case title is required.")
            .MaximumLength(250);

        RuleFor(x => x.Description)
            .MaximumLength(5000);

        RuleFor(x => x.CourtName)
            .MaximumLength(200);

        RuleFor(x => x.JudgeName)
            .MaximumLength(200);

        RuleFor(x => x.OpposingParty)
            .MaximumLength(250);
    }
}