using FluentValidation;
using LegalFlow.Application.AI.Interfaces;
using LegalFlow.Application.AI.Services;
using LegalFlow.Application.Auth.Interfaces;
using LegalFlow.Application.Auth.Services;
using LegalFlow.Application.Cases.Interfaces;
using LegalFlow.Application.Cases.Services;
using LegalFlow.Application.Clients.Interfaces;
using LegalFlow.Application.Clients.Services;
using LegalFlow.Application.Dashboard.Interfaces;
using LegalFlow.Application.Dashboard.Services;
using Microsoft.Extensions.DependencyInjection;


namespace LegalFlow.Application.DependencyInjection;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplication(
        this IServiceCollection services)
    {
        services.AddScoped<IClientService, ClientService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICaseService, CaseService>();
        services.AddScoped<ICaseHearingService, CaseHearingService>();
        services.AddScoped<ICaseTaskService, CaseTaskService>();
        services.AddScoped<ICaseNoteService, CaseNoteService>();
        services.AddScoped<ICaseDocumentService, CaseDocumentService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IAiCaseService, AiCaseService>();

        services.AddValidatorsFromAssembly(
           typeof(ApplicationServiceExtensions).Assembly);

        return services;
    }
}