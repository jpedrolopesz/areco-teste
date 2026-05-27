using Microsoft.EntityFrameworkCore;
using ProductStore.API.Data;
using ProductStore.API.Middleware;
using ProductStore.API.Services;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

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

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IProductService, ProductService>();

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy
            .WithOrigins("http://localhost:5173", "http://localhost:3000", "http://192.168.0.34:3000")
            .AllowAnyHeader()
            .AllowAnyOrigin()
            .AllowAnyMethod()
    )
);


var app = builder.Build();

try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    Log.Information("Migrations aplicadas com sucesso");
}
catch (Exception ex)
{
    Log.Fatal(ex, "Falha ao aplicar migrations");
    throw;
}

app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.MapControllers();

Log.Information("ProductStore API Iniciada - ambiente: {Env}", app.Environment.EnvironmentName);

app.Run();
