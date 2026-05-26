using System.ComponentModel.DataAnnotations;

namespace ProductStore.API.DTOs;

public class CreateProductDto
{
    [Required(ErrorMessage = "Nome é obrigatorio")]
    [MaxLength(200, ErrorMessage = "Nome deve ter no máximo 200 caracteres.")]
    public string Name { get; set; } = string.Empty;


    [Required(ErrorMessage = "SKU é obrigatorio")]
    [MaxLength(50, ErrorMessage = "SKU deve ter no máximo 50 caracteres.")]
    public string SKU { get; set; } = string.Empty;

    [Required(ErrorMessage = "Categoria é obrigatorio")]
    [MaxLength(100, ErrorMessage = "Categoria deve ter no máximo 100 caracteres.")]
    public string Category { get; set; } = string.Empty;

    [Range(0.1, double.MaxValue, ErrorMessage = "Preço deve ser maior que zero.")]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Estoque nao pode ser negativo.")]
    public int Stock { get; set; }


}
