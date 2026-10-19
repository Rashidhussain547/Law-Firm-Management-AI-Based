using LegalFlow.Application.Cases.DTOs;

namespace LegalFlow.Application.Cases.Interfaces;

public interface ICaseDocumentService
{
    Task<List<DocumentDto>> GetAllAsync(
        Guid caseId,
        Guid firmId,
        CancellationToken cancellationToken = default);

    Task<DocumentDto?> GetByIdAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default);

    Task<DocumentDto?> UploadAsync(
        Guid caseId,
        Guid firmId,
        Guid uploadedById,
        Stream fileStream,
        string originalFileName,
        string contentType,
        long fileSize,
        UploadDocumentRequest request,
        CancellationToken cancellationToken = default);

    Task<CaseDocumentFile?> GetFileAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default);
}