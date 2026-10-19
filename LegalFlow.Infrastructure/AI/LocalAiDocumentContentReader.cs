using LegalFlow.Application.AI.Interfaces;
using Microsoft.Extensions.Hosting;

namespace LegalFlow.Infrastructure.AI;

public class LocalAiDocumentContentReader
    : IAiDocumentContentReader
{
    private readonly IHostEnvironment _environment;

    public LocalAiDocumentContentReader(
        IHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<byte[]> ReadFileAsync(
        string storagePath,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(storagePath))
        {
            throw new InvalidOperationException(
                "Document storage path is empty.");
        }

        var relativePath = storagePath
            .Replace(
                "/",
                Path.DirectorySeparatorChar.ToString())
            .TrimStart(
                Path.DirectorySeparatorChar,
                Path.AltDirectorySeparatorChar);

        var wwwRootPath = Path.Combine(
            _environment.ContentRootPath,
            "wwwroot");

        var fullPath = Path.GetFullPath(
            Path.Combine(
                wwwRootPath,
                relativePath));

        var uploadsRoot = Path.GetFullPath(
            Path.Combine(
                wwwRootPath,
                "uploads",
                "cases"));

        if (!fullPath.StartsWith(
                uploadsRoot,
                StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException(
                "Invalid document storage path.");
        }

        if (!File.Exists(fullPath))
        {
            throw new FileNotFoundException(
                "Document file was not found.",
                fullPath);
        }

        return await File.ReadAllBytesAsync(
            fullPath,
            cancellationToken);
    }
}