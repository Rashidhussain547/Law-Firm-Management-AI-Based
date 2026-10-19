using LegalFlow.Application.Auth.Interfaces;
using LegalFlow.Application.Cases.Interfaces;
using LegalFlow.Application.Clients.Interfaces;
using LegalFlow.Application.Dashboard.Interfaces;
using LegalFlow.Infrastructure.Authentication;
using LegalFlow.Infrastructure.Persistence;
using LegalFlow.Infrastructure.Persistence.Repositories;
using LegalFlow.Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using LegalFlow.Application.AI.Interfaces;
using LegalFlow.Infrastructure.AI;


namespace LegalFlow.Infrastructure.DependencyInjection;

public static class InfrastructureServiceExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<LegalFlowDbContext>(options =>
        {
            options.UseNpgsql(connectionString);
        });

        services.AddScoped<IClientRepository, ClientRepository>();
        services.AddScoped<IPasswordService, PasswordService>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IFirmRepository, FirmRepository>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<ICaseRepository, CaseRepository>();
        services.AddScoped<ICaseHearingRepository, CaseHearingRepository>();
        services.AddScoped<ICaseTaskRepository, CaseTaskRepository>();
        services.AddScoped<ICaseNoteRepository, CaseNoteRepository>();
        services.AddScoped<ICaseDocumentRepository, CaseDocumentRepository>();
        services.AddScoped<IFileStorageService, LocalFileStorageService>();
        services.AddScoped<IDashboardRepository, DashboardRepository>();
        services.Configure<GeminiOptions>(configuration.GetSection("Gemini"));
        services.AddHttpClient<IAiService, GeminiAiService>();
        services.AddScoped<ICaseAiRepository, CaseAiRepository>();
        services.AddScoped<IAiDocumentRepository,AiDocumentRepository>();
        services.AddScoped<IAiDocumentContentReader,LocalAiDocumentContentReader>();

        return services;
    }
}