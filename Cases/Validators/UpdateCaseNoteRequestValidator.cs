using FluentValidation;
using LegalFlow.Application.Cases.DTOs;

namespace LegalFlow.Application.Cases.Validators;

public class UpdateCaseNoteRequestValidator
    : AbstractValidator<UpdateCaseNoteRequest>
{
    public UpdateCaseNoteRequestValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty()
            .WithMessage("Note content is required.")
            .MaximumLength(10000);
    }
}