using System.Net;
using System.Text.Json;
using LegalFlow.Application.Common.Models;
using Microsoft.AspNetCore.Diagnostics;

namespace LegalFlow.Api.Middleware;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(
        ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(
            exception,
            "An unhandled exception occurred.");

        httpContext.Response.StatusCode =
            (int)HttpStatusCode.InternalServerError;

        httpContext.Response.ContentType =
            "application/json";

        var response = ApiResponse<object>.FailureResponse(
            "An unexpected error occurred.");

        var json = JsonSerializer.Serialize(response);

        await httpContext.Response.WriteAsync(
            json,
            cancellationToken);

        return true;
    }
}