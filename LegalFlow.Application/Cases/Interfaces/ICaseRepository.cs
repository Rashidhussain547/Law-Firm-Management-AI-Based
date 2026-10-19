using LegalFlow.Domain.Entities;

namespace LegalFlow.Application.Cases.Interfaces;

public interface ICaseRepository
{
    Task<List<Case>> GetAllAsync(
        Guid firmId,
        CancellationToken cancellationToken = default);

    Task<Case?> GetByIdAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsByCaseNumberAsync(
        Guid firmId,
        string caseNumber,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Case caseEntity,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        Case caseEntity,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Case caseEntity,
        CancellationToken cancellationToken = default);

    Task<User?> GetUserByIdAndFirmIdAsync(
    Guid userId,
    Guid firmId,
    CancellationToken cancellationToken = default);

    Task<List<User>> GetAssistantsByLawyerIdAsync(
    Guid lawyerId,
    Guid firmId,
    CancellationToken cancellationToken = default);
}