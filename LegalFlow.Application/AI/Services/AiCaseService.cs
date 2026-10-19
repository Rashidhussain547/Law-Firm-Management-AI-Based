using System.Text;
using System.Text.Json;
using LegalFlow.Application.AI.DTOs;
using LegalFlow.Application.AI.Interfaces;
using LegalFlow.Application.AI.Models;

namespace LegalFlow.Application.AI.Services;

public class AiCaseService : IAiCaseService
{
    private readonly ICaseAiRepository _caseAiRepository;
    private readonly IAiService _aiService;
    private readonly IAiDocumentRepository _aiDocumentRepository;
    private readonly IAiDocumentContentReader _documentContentReader;

    public AiCaseService(
        ICaseAiRepository caseAiRepository,
        IAiService aiService,
          IAiDocumentRepository aiDocumentRepository,
    IAiDocumentContentReader documentContentReader)
    {
        _caseAiRepository = caseAiRepository;
        _aiService = aiService;
        _aiDocumentRepository = aiDocumentRepository;
        _documentContentReader = documentContentReader;
    }

    public async Task<CaseSummaryDto?> GenerateCaseSummaryAsync(
        Guid caseId,
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        var context = await _caseAiRepository.GetCaseContextAsync(
            caseId,
            firmId,
            cancellationToken);

        if (context == null)
        {
            return null;
        }

        var prompt = BuildPrompt(context);

        var aiResponse = await _aiService.GenerateTextAsync(
            prompt,
            cancellationToken);

        return ParseResponse(
            aiResponse,
            context);
    }

    private static string BuildPrompt(CaseAiContext context)
    {
        var builder = new StringBuilder();

        builder.AppendLine("""
            You are an AI assistant inside LegalFlow, a legal case
            management system.

            Your job is to summarize the provided case-management data.

            IMPORTANT RULES:
            1. Use ONLY the information provided below.
            2. Do NOT invent facts, dates, parties, legal provisions,
               outcomes, or evidence.
            3. If information is missing, explicitly say that it is not
               available in the provided case data.
            4. Do NOT provide legal advice.
            5. Do NOT predict a court outcome.
            6. Clearly distinguish facts from observations.
            7. Keep the summary concise but useful for a lawyer.
            8. Return ONLY valid JSON.
            
            JSON format:
            {
              "overview": "string",
              "keyIssues": ["string"],
              "currentStatus": "string",
              "importantDates": ["string"],
              "pendingActions": ["string"],
              "potentialConcerns": ["string"],
              "recommendedNextStep": "string"
            }
            """);

        builder.AppendLine();
        builder.AppendLine("CASE INFORMATION");
        builder.AppendLine("----------------");

        builder.AppendLine($"Case Number: {context.CaseNumber}");
        builder.AppendLine($"Title: {context.Title}");
        builder.AppendLine($"Type: {context.Type}");
        builder.AppendLine($"Status: {context.Status}");
        builder.AppendLine($"Description: {context.Description ?? "Not available"}");
        builder.AppendLine($"Court: {context.CourtName ?? "Not available"}");
        builder.AppendLine($"Judge: {context.JudgeName ?? "Not available"}");
        builder.AppendLine(
            $"Opposing Party: {context.OpposingParty ?? "Not available"}");

        builder.AppendLine(
            $"Opened Date: {FormatDate(context.OpenedDate)}");

        builder.AppendLine(
            $"Closed Date: {FormatDate(context.ClosedDate)}");

        builder.AppendLine();
        builder.AppendLine("CLIENT");
        builder.AppendLine("------");
        builder.AppendLine(
            context.ClientName ?? "Not available");

        builder.AppendLine();
        builder.AppendLine("ASSIGNMENTS");
        builder.AppendLine("-----------");

        builder.AppendLine(
            $"Lawyer: {context.LawyerName ?? "Not assigned"}");

        builder.AppendLine(
            $"Assistant: {context.AssistantName ?? "Not assigned"}");

        builder.AppendLine();
        builder.AppendLine("HEARINGS");
        builder.AppendLine("--------");

        if (context.Hearings.Count == 0)
        {
            builder.AppendLine("No hearings available.");
        }
        else
        {
            foreach (var hearing in context.Hearings)
            {
                builder.AppendLine(
                    $"- Date: {FormatDate(hearing.HearingDate)}");

                builder.AppendLine(
                    $"  Court Room: {hearing.CourtRoom ?? "Not available"}");

                builder.AppendLine(
                    $"  Purpose: {hearing.Purpose ?? "Not available"}");

                builder.AppendLine(
                    $"  Status: {hearing.Status}");

                builder.AppendLine(
                    $"  Notes: {hearing.Notes ?? "None"}");
            }
        }

        builder.AppendLine();
        builder.AppendLine("TASKS");
        builder.AppendLine("-----");

        if (context.Tasks.Count == 0)
        {
            builder.AppendLine("No tasks available.");
        }
        else
        {
            foreach (var task in context.Tasks)
            {
                builder.AppendLine($"- Title: {task.Title}");

                builder.AppendLine(
                    $"  Description: {task.Description ?? "Not available"}");

                builder.AppendLine(
                    $"  Status: {task.Status}");

                builder.AppendLine(
                    $"  Priority: {task.Priority}");

                builder.AppendLine(
                    $"  Due Date: {FormatDate(task.DueDate)}");

                builder.AppendLine(
                    $"  Completed At: {FormatDate(task.CompletedAt)}");
            }
        }

        builder.AppendLine();
        builder.AppendLine("NOTES");
        builder.AppendLine("-----");

        if (context.Notes.Count == 0)
        {
            builder.AppendLine("No notes available.");
        }
        else
        {
            foreach (var note in context.Notes)
            {
                builder.AppendLine(
                    $"- Created: {FormatDate(note.CreatedAt)}");

                builder.AppendLine(
                    $"  Content: {note.Content}");
            }
        }

        builder.AppendLine();
        builder.AppendLine("DOCUMENTS");
        builder.AppendLine("---------");

        if (context.Documents.Count == 0)
        {
            builder.AppendLine("No documents available.");
        }
        else
        {
            foreach (var document in context.Documents)
            {
                builder.AppendLine(
                    $"- File: {document.FileName}");

                builder.AppendLine(
                    $"  Type: {document.Type}");

                builder.AppendLine(
                    $"  Description: {document.Description ?? "None"}");

                builder.AppendLine(
                    $"  AI Processed: {document.IsAiProcessed}");

                if (!string.IsNullOrWhiteSpace(document.AiSummary))
                {
                    builder.AppendLine(
                        $"  Existing AI Summary: {document.AiSummary}");
                }
            }
        }

        return builder.ToString();
    }

    private static CaseSummaryDto ParseResponse(
        string aiResponse,
        CaseAiContext context)
    {
        var json = ExtractJson(aiResponse);

        try
        {
            var result = JsonSerializer.Deserialize<CaseSummaryDto>(
                json,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

            if (result == null)
            {
                throw new InvalidOperationException(
                    "AI returned an empty summary.");
            }

            result.CaseId = context.CaseId;
            result.CaseNumber = context.CaseNumber;
            result.Title = context.Title;

            return result;
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException(
                "AI returned an invalid summary format.",
                ex);
        }
    }

    private static string ExtractJson(string response)
    {
        if (string.IsNullOrWhiteSpace(response))
        {
            throw new InvalidOperationException(
                "AI returned an empty response.");
        }

        response = response.Trim();

        if (response.StartsWith("```"))
        {
            var firstNewLine = response.IndexOf('\n');

            if (firstNewLine >= 0)
            {
                response = response[(firstNewLine + 1)..];
            }

            var closingFence = response.LastIndexOf("```");

            if (closingFence >= 0)
            {
                response = response[..closingFence];
            }
        }

        return response.Trim();
    }

    private static string FormatDate(DateTime? value)
    {
        return value?.ToString("yyyy-MM-dd HH:mm") ?? "Not available";
    }
    public async Task<DocumentAnalysisDto?> AnalyzeDocumentAsync(
    Guid documentId,
    Guid caseId,
    Guid firmId,
    CancellationToken cancellationToken = default)
    {
        var document =
            await _aiDocumentRepository.GetDocumentContextAsync(
                documentId,
                caseId,
                firmId,
                cancellationToken);

        if (document == null)
        {
            return null;
        }

        var fileBytes =
            await _documentContentReader.ReadFileAsync(
                document.StoragePath,
                cancellationToken);

        var prompt = BuildDocumentAnalysisPrompt(document);

        var aiResponse =
            await _aiService.AnalyzeDocumentAsync(
                document.OriginalFileName,
                document.ContentType,
                fileBytes,
                prompt,
                cancellationToken);

        var analysis =
            ParseDocumentAnalysis(
                aiResponse,
                document);

        await _aiDocumentRepository.UpdateAiAnalysisAsync(
            documentId,
            analysis.Summary,
            cancellationToken);

        return analysis;
    }

    private static string BuildDocumentAnalysisPrompt(
      AiDocumentContext document)
    {
        return $$"""
You are an AI legal document analysis assistant
inside a legal case management system.

You are analyzing ONE document that belongs to a specific case.

CASE INFORMATION
Case Number: {{document.CaseNumber}}
Case Title: {{document.CaseTitle}}

DOCUMENT INFORMATION
File Name: {{document.OriginalFileName}}
Document Type: {{document.DocumentType}}
Description: {{document.Description ?? "Not provided"}}

TASK

Analyze the document carefully.

Return ONLY valid JSON.

Use exactly this structure:

{
  "summary": "A concise but useful summary of the document.",
  "keyPoints": [
    "Important point 1",
    "Important point 2"
  ],
  "importantDates": [
    "Date and why it matters"
  ],
  "parties": [
    "Party name and role"
  ],
  "potentialIssues": [
    "Potential legal or case-management issue"
  ],
  "importantClauses": [
    "Important clause or obligation"
  ],
  "recommendedAction": "Practical next action for the legal team."
}

RULES

1. Do not invent facts.
2. Use only information present in the document.
3. If a category has no information, return an empty array.
4. Clearly distinguish facts from potential concerns.
5. Do not provide definitive legal conclusions.
6. Do not claim that a party is legally right or wrong.
7. Identify dates that may be relevant to the case.
8. Identify parties and their apparent roles.
9. Identify important obligations, deadlines, termination terms,
   payment terms, notices or other significant clauses when present.
10. Keep the summary concise but useful.
11. This is legal case-management assistance, not legal advice.

Return JSON only.
""";
    }

    private static DocumentAnalysisDto ParseDocumentAnalysis(
    string aiResponse,
    AiDocumentContext document)
    {
        var cleanedResponse = aiResponse.Trim();

        if (cleanedResponse.StartsWith("```"))
        {
            cleanedResponse = cleanedResponse
                .Replace("```json", string.Empty)
                .Replace("```", string.Empty)
                .Trim();
        }

        var result =
            JsonSerializer.Deserialize<DocumentAnalysisResult>(
                cleanedResponse,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

        if (result == null)
        {
            throw new InvalidOperationException(
                "AI returned an invalid document analysis.");
        }

        return new DocumentAnalysisDto
        {
            DocumentId = document.DocumentId,
            CaseId = document.CaseId,
            FileName = document.OriginalFileName,
            DocumentType = document.DocumentType,
            Summary = result.Summary ?? string.Empty,
            KeyPoints = result.KeyPoints ?? new(),
            ImportantDates = result.ImportantDates ?? new(),
            Parties = result.Parties ?? new(),
            PotentialIssues = result.PotentialIssues ?? new(),
            ImportantClauses = result.ImportantClauses ?? new(),
            RecommendedAction =
                result.RecommendedAction ?? string.Empty
        };
    }

    private class DocumentAnalysisResult
    {
        public string? Summary { get; set; }

        public List<string>? KeyPoints { get; set; }

        public List<string>? ImportantDates { get; set; }

        public List<string>? Parties { get; set; }

        public List<string>? PotentialIssues { get; set; }

        public List<string>? ImportantClauses { get; set; }

        public string? RecommendedAction { get; set; }
    }

}