using FluentValidation;
using LegalFlow.Application.Cases.DTOs;

namespace LegalFlow.Application.Cases.Validators;

public class UploadDocumentRequestValidator
    : AbstractValidator<UploadDocumentRequest>
{
    public UploadDocumentRequestValidator()
    {
        RuleFor(x => x.Description)
            .MaximumLength(1000);

        RuleFor(x => x.FileName)
            .NotEmpty();

        RuleFor(x => x.ContentType)
            .NotEmpty();

        RuleFor(x => x.FileSize)
            .GreaterThan(0)
            .LessThanOrEqualTo(10 * 1024 * 1024)
            .WithMessage("File size must be 10 MB or less.");
    }
}