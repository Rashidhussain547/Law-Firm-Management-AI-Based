using LegalFlow.Application.AI.Interfaces;
using LegalFlow.Application.AI.Models;
using LegalFlow.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LegalFlow.Infrastructure.AI;

public class CaseAiRepository : ICaseAiRepository
{
    private readonly LegalFlowDbContext _context;

    public CaseAiRepository(LegalFlowDbContext context)
    {
        _context = context;
    }

    public async Task<CaseAiContext?> GetCaseContextAsync(
        Guid caseId,
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        var caseData = await _context.Cases
            .AsNoTracking()
            .Where(x => x.Id == caseId && x.FirmId == firmId)
            .Select(x => new
            {
                Case = x,

                Client = x.Client,

                Lawyer = x.AssignedLawyer,

                Assistant = x.AssignedAssistant
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (caseData == null)
        {
            return null;
        }

        var hearings = await _context.CaseHearings
            .AsNoTracking()
            .Where(x => x.CaseId == caseId)
            .OrderBy(x => x.HearingDate)
            .Select(x => new CaseAiHearing
            {
                HearingDate = x.HearingDate,
                CourtRoom = x.CourtRoom,
                Purpose = x.Purpose,
                Status = x.Status.ToString(),
                Notes = x.Notes
            })
            .ToListAsync(cancellationToken);

        var tasks = await _context.CaseTasks
            .AsNoTracking()
            .Where(x => x.CaseId == caseId)
            .OrderBy(x => x.DueDate)
            .Select(x => new CaseAiTask
            {
                Title = x.Title,
                Description = x.Description,
                Status = x.Status.ToString(),
                Priority = x.Priority.ToString(),
                DueDate = x.DueDate,
                CompletedAt = x.CompletedAt
            })
            .ToListAsync(cancellationToken);

        var notes = await _context.CaseNotes
            .AsNoTracking()
            .Where(x => x.CaseId == caseId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new CaseAiNote
            {
                Content = x.Content,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        var documents = await _context.CaseDocuments
            .AsNoTracking()
            .Where(x => x.CaseId == caseId)
            .OrderBy(x => x.OriginalFileName)
            .Select(x => new CaseAiDocument
            {
                FileName = x.OriginalFileName ?? x.FileName,
                Description = x.Description,
                Type = x.Type.ToString(),
                IsAiProcessed = x.IsAiProcessed,
                AiSummary = x.AiSummary
            })
            .ToListAsync(cancellationToken);

        return new CaseAiContext
        {
            CaseId = caseData.Case.Id,
            CaseNumber = caseData.Case.CaseNumber,
            Title = caseData.Case.Title,
            Description = caseData.Case.Description,
            Type = caseData.Case.Type.ToString(),
            Status = caseData.Case.Status.ToString(),
            CourtName = caseData.Case.CourtName,
            JudgeName = caseData.Case.JudgeName,
            OpposingParty = caseData.Case.OpposingParty,
            OpenedDate = caseData.Case.OpenedDate,
            ClosedDate = caseData.Case.ClosedDate,

            ClientName = caseData.Client == null
                ? null
                : $"{caseData.Client.FirstName} {caseData.Client.LastName}".Trim(),

            LawyerName = caseData.Lawyer == null
                ? null
                : $"{caseData.Lawyer.FirstName} {caseData.Lawyer.LastName}".Trim(),

            AssistantName = caseData.Assistant == null
                ? null
                : $"{caseData.Assistant.FirstName} {caseData.Assistant.LastName}".Trim(),

            Hearings = hearings,
            Tasks = tasks,
            Notes = notes,
            Documents = documents
        };
    }
}