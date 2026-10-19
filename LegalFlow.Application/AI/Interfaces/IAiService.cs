namespace LegalFlow.Application.AI.Interfaces;

public interface IAiService
{
    Task<string> GenerateTextAsync(
        string prompt,
        CancellationToken cancellationToken = default);

    Task<string> AnalyzeDocumentAsync(
       string fileName,
       string contentType,
       byte[] fileBytes,
       string prompt,
       CancellationToken cancellationToken = default);
}