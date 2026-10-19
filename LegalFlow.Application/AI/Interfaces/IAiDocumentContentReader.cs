namespace LegalFlow.Application.AI.Interfaces;

public interface IAiDocumentContentReader
{
    Task<byte[]> ReadFileAsync(
        string storagePath,
        CancellationToken cancellationToken = default);
}