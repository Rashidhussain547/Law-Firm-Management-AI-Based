using LegalFlow.Application.Cases.DTOs;
using LegalFlow.Application.Cases.Interfaces;
using LegalFlow.Domain.Entities;

namespace LegalFlow.Application.Cases.Services;

public class CaseDocumentService : ICaseDocumentService
{
    private readonly ICaseDocumentRepository _documentRepository;
    private readonly ICaseRepository _caseRepository;
    private readonly IFileStorageService _fileStorageService;

    public CaseDocumentService(
        ICaseDocumentRepository documentRepository,
        ICaseRepository caseRepository,
        IFileStorageService fileStorageService)
    {
        _documentRepository = documentRepository;
        _caseRepository = caseRepository;
        _fileStorageService = fileStorageService;
    }

    public async Task<List<DocumentDto>> GetAllAsync(
        Guid caseId,
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        var caseEntity = await _caseRepository.GetByIdAsync(
            caseId,
            firmId,
            cancellationToken);

        if (caseEntity is null)
        {
            return new List<DocumentDto>();
        }

        var documents = await _documentRepository.GetAllByCaseIdAsync(
            caseId,
            cancellationToken);

        return documents.Select(MapToDto).ToList();
    }

    public async Task<DocumentDto?> GetByIdAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        var document = await _documentRepository.GetByIdAsync(
            id,
            cancellationToken);

        if (document is null)
        {
            return null;
        }

        var caseEntity = await _caseRepository.GetByIdAsync(
            document.CaseId,
            firmId,
            cancellationToken);

        if (caseEntity is null)
        {
            return null;
        }

        return MapToDto(document);
    }

    public async Task<DocumentDto?> UploadAsync(
        Guid caseId,
        Guid firmId,
        Guid uploadedById,
        Stream fileStream,
        string originalFileName,
        string contentType,
        long fileSize,
        UploadDocumentRequest request,
        CancellationToken cancellationToken = default)
    {
        var caseEntity = await _caseRepository.GetByIdAsync(
            caseId,
            firmId,
            cancellationToken);

        if (caseEntity is null)
        {
            return null;
        }

        var storagePath = await _fileStorageService.SaveAsync(
            fileStream,
            originalFileName,
            cancellationToken);

        var document = new CaseDocument
        {
            Id = Guid.NewGuid(),
            CaseId = caseId,
            UploadedById = uploadedById,
            FileName = Path.GetFileName(storagePath),
            OriginalFileName = originalFileName,
            StoragePath = storagePath,
            ContentType = contentType,
            FileSize = fileSize,
            Type = request.Type,
            Description = request.Description,
            IsAiProcessed = false
        };

        try
        {
            await _documentRepository.AddAsync(
                document,
                cancellationToken);
        }
        catch
        {
            await _fileStorageService.DeleteAsync(
                storagePath,
                cancellationToken);

            throw;
        }

        return MapToDto(document);
    }

    public async Task<CaseDocumentFile?> GetFileAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        var document = await _documentRepository.GetByIdAsync(
            id,
            cancellationToken);

        if (document is null)
        {
            return null;
        }

        var caseEntity = await _caseRepository.GetByIdAsync(
            document.CaseId,
            firmId,
            cancellationToken);

        if (caseEntity is null)
        {
            return null;
        }

        var stream = await _fileStorageService.GetAsync(
            document.StoragePath,
            cancellationToken);

        if (stream is null)
        {
            return null;
        }

        return new CaseDocumentFile
        {
            Stream = stream,
            FileName = document.OriginalFileName,
            ContentType = document.ContentType
        };
    }

    public async Task<bool> DeleteAsync(
        Guid id,
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        var document = await _documentRepository.GetByIdAsync(
            id,
            cancellationToken);

        if (document is null)
        {
            return false;
        }

        var caseEntity = await _caseRepository.GetByIdAsync(
            document.CaseId,
            firmId,
            cancellationToken);

        if (caseEntity is null)
        {
            return false;
        }

        await _fileStorageService.DeleteAsync(
            document.StoragePath,
            cancellationToken);

        await _documentRepository.DeleteAsync(
            document,
            cancellationToken);

        return true;
    }

    private static DocumentDto MapToDto(
        CaseDocument document)
    {
        return new DocumentDto
        {
            Id = document.Id,
            CaseId = document.CaseId,
            UploadedById = document.UploadedById,
            FileName = document.FileName,
            OriginalFileName = document.OriginalFileName,
            ContentType = document.ContentType,
            FileSize = document.FileSize,
            Type = document.Type,
            Description = document.Description,
            IsAiProcessed = document.IsAiProcessed,
            AiSummary = document.AiSummary,
            CreatedAt = document.CreatedAt,
            UpdatedAt = document.UpdatedAt
        };
    }
}