using LegalFlow.Application.Dashboard.DTOs;

namespace LegalFlow.Application.Dashboard.Interfaces;

public interface IDashboardRepository
{
    Task<DashboardDto> GetDashboardAsync(
        Guid firmId,
        CancellationToken cancellationToken = default);
}