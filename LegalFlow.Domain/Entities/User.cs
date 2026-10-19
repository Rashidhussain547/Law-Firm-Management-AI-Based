using LegalFlow.Domain.Common;

namespace LegalFlow.Domain.Entities;

public class User : BaseEntity
{
    public Guid FirmId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public Firm Firm { get; set; } = null!;

    public string PasswordHash { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public Guid? ReportsToUserId { get; set; }

    public User? ReportsToUser { get; set; }

    public ICollection<User> Assistants { get; set; } = new List<User>();

    public ICollection<Case> AssignedCases { get; set; } = new List<Case>();

    public ICollection<CaseTask> AssignedTasks { get; set; } = new List<CaseTask>();

    public ICollection<CaseDocument> UploadedDocuments { get; set; } = new List<CaseDocument>();

    public ICollection<CaseNote> CreatedNotes { get; set; } = new List<CaseNote>();
}