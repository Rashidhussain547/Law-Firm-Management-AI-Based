using LegalFlow.Application.Dashboard.DTOs;
using LegalFlow.Application.Dashboard.Interfaces;
using LegalFlow.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using LDE = LegalFlow.Domain.Enums;

namespace LegalFlow.Infrastructure.Persistence.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly LegalFlowDbContext _dbContext;

    public DashboardRepository(
        LegalFlowDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<DashboardDto> GetDashboardAsync(
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        var firmName = await _dbContext.Firms
            .AsNoTracking()
            .Where(x => x.Id == firmId)
            .Select(x => x.Name)
            .FirstOrDefaultAsync(cancellationToken)
            ?? string.Empty;

        var activeCases = await _dbContext.Cases
            .AsNoTracking()
            .CountAsync(
                x => x.FirmId == firmId &&
                     (x.Status == CaseStatus.Open ||
                      x.Status == CaseStatus.InProgress),
                cancellationToken);

        var totalClients = await _dbContext.Clients
            .AsNoTracking()
            .CountAsync(
                x => x.FirmId == firmId &&
                     x.IsActive,
                cancellationToken);

        var today = DateTime.UtcNow.Date;

        var startOfWeek = today.AddDays(
            -(int)today.DayOfWeek);

        var endOfWeek = startOfWeek.AddDays(7);

        var hearingsThisWeek = await _dbContext.CaseHearings
            .AsNoTracking()
            .Where(x =>
                x.Case.FirmId == firmId &&
                x.HearingDate >= startOfWeek &&
                x.HearingDate < endOfWeek &&
                x.Status == HearingStatus.Scheduled)
            .CountAsync(cancellationToken);

        var tasksDue = await _dbContext.CaseTasks
            .AsNoTracking()
            .Where(x =>
                x.Case.FirmId == firmId &&
                x.DueDate.HasValue &&
                x.DueDate.Value.Date <= today &&
                x.Status != LDE.TaskStatus.Completed &&
                x.Status != LDE.TaskStatus.Cancelled)
            .CountAsync(cancellationToken);


        var caseOverview = new CaseOverviewDto
        {
            Active = await _dbContext.Cases
                .AsNoTracking()
                .CountAsync(
                    x => x.FirmId == firmId &&
                         (x.Status == CaseStatus.Open ||
                          x.Status == CaseStatus.InProgress),
                    cancellationToken),

            Pending = await _dbContext.Cases
                .AsNoTracking()
                .CountAsync(
                    x => x.FirmId == firmId &&
                         x.Status == CaseStatus.OnHold,
                    cancellationToken),

            Closed = await _dbContext.Cases
                .AsNoTracking()
                .CountAsync(
                    x => x.FirmId == firmId &&
                         (x.Status == CaseStatus.Won ||
                          x.Status == CaseStatus.Lost ||
                          x.Status == CaseStatus.Closed),
                    cancellationToken)
        };

        var upcomingHearings = await _dbContext.CaseHearings
            .AsNoTracking()
            .Where(x =>
                x.Case.FirmId == firmId &&
                x.HearingDate >= DateTime.UtcNow &&
                x.Status == HearingStatus.Scheduled)
            .OrderBy(x => x.HearingDate)
            .Take(5)
            .Select(x => new UpcomingHearingDto
            {
                Id = x.Id,
                CaseId = x.CaseId,
                HearingDate = x.HearingDate,
                CaseNumber = x.Case.CaseNumber,
                CaseTitle = x.Case.Title,
                CourtName = x.Case.CourtName,
                CourtRoom = x.CourtRoom,
                Status = x.Status
            })
            .ToListAsync(cancellationToken);

        var recentCases = await _dbContext.Cases
            .AsNoTracking()
            .Where(x => x.FirmId == firmId)
            .OrderByDescending(x => x.OpenedDate)
            .Take(5)
            .Select(x => new RecentCaseDto
            {
                Id = x.Id,
                CaseNumber = x.CaseNumber,
                Title = x.Title,
                ClientName =
                    x.Client.CompanyName ??
                    (x.Client.FirstName + " " + x.Client.LastName),
                Status = x.Status,
                OpenedDate = x.OpenedDate
            })
            .ToListAsync(cancellationToken);

        return new DashboardDto
        {
            FirmName = firmName,
            ActiveCases = activeCases,
            TotalClients = totalClients,
            HearingsThisWeek = hearingsThisWeek,
            TasksDue = tasksDue,
            CaseOverview = caseOverview,
            UpcomingHearings = upcomingHearings,
            RecentCases = recentCases
        };
    }
}