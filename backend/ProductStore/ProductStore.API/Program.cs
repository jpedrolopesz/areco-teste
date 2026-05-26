using Microsoft.EntityFreameworkCore;
using ProductStore.API.Data;
using ProductStore.API.Middleware;
using ProductStore.API.Services;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "ProductStore API",
        Version = "v1",
        Description = "API para gestao de produtos com regras de negocio e paginaçao"
    });
});

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IProductService, ProductService>();

builder.Services.AddCors(options =>
    policy
        .WithOrigins("http:/localhost:5173", "http://localhost:3000")
        .AllowAnyHeader()
        .AllowAnyMethod()
);


try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    db.Database.Migration();
    Log.Information("Migrations aplicada com sucesso");
}
catch (Exception ex)
{
    Log.Fatal(ex, "Falha ao aplicar migrations");
    throw;
}

Log.Information("ProductStore API Iniciada - ambiente: {Env}",
app.Environment.EnvironmentName);

app.Run();
