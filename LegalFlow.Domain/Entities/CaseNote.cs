using LegalFlow.Domain.Common;

namespace LegalFlow.Domain.Entities;

public class CaseNote : BaseEntity
{
    public Guid CaseId { get; set; }

    public Guid CreatedById { get; set; }

    public string Content { get; set; } = string.Empty;

    public Case Case { get; set; } = null!;

    public User CreatedBy { get; set; } = null!;
}