using LegalFlow.Application.Cases.Interfaces;

namespace LegalFlow.Infrastructure.Storage;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _rootPath;

    public LocalFileStorageService()
    {
        _rootPath = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            "uploads",
            "cases");

        Directory.CreateDirectory(_rootPath);
    }

    public async Task<string> SaveAsync(
        Stream fileStream,
        string fileName,
        CancellationToken cancellationToken = default)
    {
        var uniqueFileName =
            $"{Guid.NewGuid()}_{fileName}";

        var fullPath = Path.Combine(
            _rootPath,
            uniqueFileName);

        await using var outputStream =
            new FileStream(
                fullPath,
                FileMode.CreateNew,
                FileAccess.Write,
                FileShare.None);

        await fileStream.CopyToAsync(
            outputStream,
            cancellationToken);

        return Path.Combine(
            "uploads",
            "cases",
            uniqueFileName)
            .Replace("\\", "/");
    }

    public Task<Stream?> GetAsync(
        string storagePath,
        CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            storagePath);

        if (!File.Exists(fullPath))
        {
            return Task.FromResult<Stream?>(null);
        }

        Stream stream = new FileStream(
            fullPath,
            FileMode.Open,
            FileAccess.Read,
            FileShare.Read);

        return Task.FromResult<Stream?>(stream);
    }

    public Task DeleteAsync(
        string storagePath,
        CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            storagePath);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }

        return Task.CompletedTask;
    }
}