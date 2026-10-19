using FluentValidation;
using LegalFlow.Application.Cases.DTOs;

namespace LegalFlow.Application.Cases.Validators;

public class CreateHearingRequestValidator
    : AbstractValidator<CreateHearingRequest>
{
    public CreateHearingRequestValidator()
    {
        RuleFor(x => x.HearingDate)
            .NotEmpty()
            .WithMessage("Hearing date is required.");

        RuleFor(x => x.CourtRoom)
            .MaximumLength(100);

        RuleFor(x => x.Purpose)
            .MaximumLength(500);

        RuleFor(x => x.Notes)
            .MaximumLength(5000);
    }
}