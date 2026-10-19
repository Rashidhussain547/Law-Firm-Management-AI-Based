using FluentValidation;
using LegalFlow.Application.Cases.DTOs;

namespace LegalFlow.Application.Cases.Validators;

public class UpdateTaskRequestValidator
    : AbstractValidator<UpdateTaskRequest>
{
    public UpdateTaskRequestValidator()
    {
        RuleFor(x => x.AssignedToId)
            .NotEmpty()
            .WithMessage("Assigned user is required.");

        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Task title is required.")
            .MaximumLength(250);

        RuleFor(x => x.Description)
            .MaximumLength(5000);
    }
}