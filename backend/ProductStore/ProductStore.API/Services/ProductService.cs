using Microsoft.EntityFrameworkCore;
using ProductStore.API.Data;
using ProductStore.API.DTOs;
using ProductStore.API.Models;
using System.Text;

namespace ProductStore.API.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _db;
    private readonly ILogger<ProductService> _logger;

    private const string ElectronicsCategory = "Eletrônicos";
    private const decimal ElectronicsMinPrice = 50m;

    public ProductService(AppDbContext db, ILogger<ProductService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<PagedResultDto<ProductResponseDto>> GetAllAsync(int page, int pageSize)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.Products.AsNoTracking();
        var totalCount = await query.CountAsync();

        var products = await query
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        _logger.LogInformation(
            "Listagem de produtos - pagina {Page}, tamanho {PageSize}, total {Total}",
            page, pageSize, totalCount);

        return new PagedResultDto<ProductResponseDto>
        {
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            Data = products.Select(MapToResponse).ToList()
        };
    }

    public async Task<ProductResponseDto?> GetByIdAsync(int id)
    {
        var product = await _db.Products.FindAsync(id);

        if (product is null)
        {
            _logger.LogWarning("Produto ID {id} nao encontrado", id);
            return null;
        }

        return MapToResponse(product);
    }

    public async Task<ProductResponseDto> CreateAsync(CreateProductDto dto)
    {
        ApplyBusinessRules(dto.Category, dto.Price, dto.Stock);

        var skuExists = await _db.Products.AnyAsync(p => p.SKU == dto.SKU.Trim().ToUpper());

        if (skuExists)
        {
            _logger.LogWarning("Tentativa de criar produto com SKU duplicado: {SKU}", dto.SKU);
            throw new InvalidOperationException($"Já existe um produto com o SKU '{dto.SKU}'.");
        }

        var product = new Models.Product
        {
            Name = dto.Name,
            SKU = dto.SKU.Trim().ToUpper(),
            Category = dto.Category,
            Price = dto.Price,
            Stock = dto.Stock,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        _logger.LogInformation(  // fix: was "LongInFormation"
            "Produto criado - ID: {Id} | Nome: {Name} | SKU: {SKU} | Categoria: {Category} | Preço: {Price} | Estoque: {Stock}",
            product.Id, product.Name, product.SKU, product.Category, product.Price, product.Stock);

        return MapToResponse(product);
    }

    public async Task<ProductResponseDto> UpdateAsync(int id, UpdateProductDto dto)
    {
        var product = await _db.Products.FindAsync(id)
            ?? throw new KeyNotFoundException($"Produto com ID {id} nao encontrado.");

        ApplyBusinessRules(dto.Category, dto.Price, dto.Stock);

        product.Name = dto.Name;
        product.Category = dto.Category;
        product.Price = dto.Price;
        product.Stock = dto.Stock;
        product.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        _logger.LogInformation(
            "Produto atualizado - ID: {Id} | Nome: {Name} | SKU: {SKU} | Categoria: {Category} | Preço: {Price} | Estoque: {Stock}",
            product.Id, product.Name, product.SKU, product.Category, product.Price, product.Stock);

        return MapToResponse(product);
    }

    public async Task DeleteAsync(int id)
    {
        var product = await _db.Products.FindAsync(id)
            ?? throw new KeyNotFoundException($"Produto com ID {id} nao encontrado.");

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();

        _logger.LogInformation(
            "Produto removido - ID: {Id} | Nome: {Name} | SKU: {SKU}",
            product.Id, product.Name, product.SKU);
    }

    private static void ApplyBusinessRules(string category, decimal price, int stock)
    {
        if (stock < 0)
            throw new ArgumentException("Estoque nao pode ser inferior a zero");

        var normalizedCategory = category.Trim().Normalize(NormalizationForm.FormC);
        var normalizedElectronics = ElectronicsCategory.Normalize(NormalizationForm.FormC);

        if (normalizedCategory.Equals(normalizedElectronics, StringComparison.OrdinalIgnoreCase)
            && price < ElectronicsMinPrice)
            throw new ArgumentException(
                $"Produtos da categoria '{ElectronicsCategory}' devem ter o preço mínimo de R$ {ElectronicsMinPrice:F2}.");
    }

    private static ProductResponseDto MapToResponse(Models.Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        SKU = p.SKU,
        Category = p.Category,
        Price = p.Price,
        Stock = p.Stock,
        CreatedAt = p.CreatedAt,
        UpdatedAt = p.UpdatedAt
    };
}
