using LegalFlow.Domain.Common;

namespace LegalFlow.Domain.Entities;

public class Firm : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public string? Email { get; set; }

    public string? Address { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<User> Users { get; set; } = new List<User>();

    public ICollection<Client> Clients { get; set; } = new List<Client>();
}