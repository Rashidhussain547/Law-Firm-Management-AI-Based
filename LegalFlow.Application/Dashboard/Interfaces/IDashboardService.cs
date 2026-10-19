using LegalFlow.Application.Dashboard.DTOs;

namespace LegalFlow.Application.Dashboard.Interfaces;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardAsync(
        Guid firmId,
        CancellationToken cancellationToken = default);
}