using System.Net.Http.Json;
using System.Text.Json;
using LegalFlow.Application.AI.Interfaces;
using Microsoft.Extensions.Options;

namespace LegalFlow.Infrastructure.AI;

public class GeminiAiService : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly GeminiOptions _options;

    public GeminiAiService(
        HttpClient httpClient,
        IOptions<GeminiOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
    }

    public async Task<string> GenerateTextAsync(
        string prompt,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            throw new InvalidOperationException(
                "Gemini API key is not configured.");
        }

        var url =
            $"https://generativelanguage.googleapis.com/v1beta/models/" +
            $"{_options.Model}:generateContent?key={_options.ApiKey}";

        var request = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new
                        {
                            text = prompt
                        }
                    }
                }
            }
        };

        using var response = await _httpClient.PostAsJsonAsync(
            url,
            request,
            cancellationToken);

        var responseBody =
            await response.Content.ReadAsStringAsync(
                cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Gemini API request failed. " +
                $"Status: {(int)response.StatusCode}. " +
                $"Response: {responseBody}");
        }

        using var json = JsonDocument.Parse(responseBody);

        var text = json.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        return text ?? string.Empty;
    }

    public async Task<string> AnalyzeDocumentAsync(
    string fileName,
    string contentType,
    byte[] fileBytes,
    string prompt,
    CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            throw new InvalidOperationException(
                "Gemini API key is not configured.");
        }

        var url =
            $"https://generativelanguage.googleapis.com/v1beta/models/" +
            $"{_options.Model}:generateContent?key={_options.ApiKey}";

        var base64Data = Convert.ToBase64String(fileBytes);

        var request = new
        {
            contents = new[]
            {
            new
            {
                parts = new object[]
                {
                    new
                    {
                        inline_data = new
                        {
                            mime_type = contentType,
                            data = base64Data
                        }
                    },
                    new
                    {
                        text = prompt
                    }
                }
            }
        }
        };

        using var response =
            await _httpClient.PostAsJsonAsync(
                url,
                request,
                cancellationToken);

        var responseBody =
            await response.Content.ReadAsStringAsync(
                cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Gemini document analysis failed. " +
                $"Status: {(int)response.StatusCode}. " +
                $"Response: {responseBody}");
        }

        using var json =
            JsonDocument.Parse(responseBody);

        var text = json.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        return text ?? string.Empty;
    }
}