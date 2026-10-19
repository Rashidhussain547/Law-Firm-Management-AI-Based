using LegalFlow.Domain.Common;

namespace LegalFlow.Domain.Entities;

public class Client : BaseEntity
{
    public Guid FirmId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string? CompanyName { get; set; }

    public string Email { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public string? Address { get; set; }

    public bool IsActive { get; set; } = true;

    public Firm Firm { get; set; } = null!;

    public ICollection<Case> Cases { get; set; } = new List<Case>();
}