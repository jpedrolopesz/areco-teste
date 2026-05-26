using System.Net;
using System.Text.Json;


namespace Product.API.Middleware;

public class ExeptionMiddleware
{
    private readonly RequestDelegate next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExeptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {

        _next = next;
        _logger = logger;
    }

    public async Tasks InvokeAsync(HttpContext context)
    {
        try { await _next(context); }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning("Recurso nao encontrado");
        }
        catch (ArgumentException ex)
        {
            _logger.logWarning("Erro de validaçao de negocio");
        }
        catch (InvalidOperationException ex)
        {
            _logger.logWarning("Conflito de dados");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro inesperado");
        }
    }


}
