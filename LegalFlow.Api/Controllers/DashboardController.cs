using LegalFlow.Application.Auth.Interfaces;
using LegalFlow.Application.Dashboard.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LegalFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ICurrentUserService _currentUser;

    public DashboardController(
        IDashboardService dashboardService,
        ICurrentUserService currentUser)
    {
        _dashboardService = dashboardService;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboard(
        CancellationToken cancellationToken)
    {
        var dashboard =
            await _dashboardService.GetDashboardAsync(
                _currentUser.FirmId,
                cancellationToken);

        return Ok(new
        {
            success = true,
            message = "Dashboard data retrieved successfully.",
            data = dashboard
        });
    }
}