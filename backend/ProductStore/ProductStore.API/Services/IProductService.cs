using ProductStore.API.DTOs;

namespace ProductStore.API.Services;

public interface IProductService
{
    Task<PagedResultDto<ProductResponseDto>> GetAllAsync(int page, int pageSize);
    Task<ProductResponseDto?> GetByIdAsync(int id);
    Task<ProductResponseDto> CreateAsync(CreateProductDto dto);
    Task<ProductResponseDto> UpdateAsync(int id, UpdateProductDto dto);
    Task DeleteAsync(int id);
}
