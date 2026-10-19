namespace LegalFlow.Application.Auth.DTOs;

public class UserDto
{
    public Guid Id { get; set; }
    public Guid? ReportsToUserId { get; set; }
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public bool IsActive { get; set; }
}