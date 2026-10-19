using LegalFlow.Application.Dashboard.DTOs;
using LegalFlow.Application.Dashboard.Interfaces;

namespace LegalFlow.Application.Dashboard.Services;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _dashboardRepository;

    public DashboardService(
        IDashboardRepository dashboardRepository)
    {
        _dashboardRepository = dashboardRepository;
    }

    public async Task<DashboardDto> GetDashboardAsync(
        Guid firmId,
        CancellationToken cancellationToken = default)
    {
        return await _dashboardRepository.GetDashboardAsync(
            firmId,
            cancellationToken);
    }
}