using Microsoft.EntityFrameworkCore;
using ProductStore.API.Models;

namespace ProductStore.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Produts => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(p => p.Id);

            entity.Property(p => p.Name)
                .IsRequired()
                .HasMaxLenght(200);

            entity.Property(p => p.SKU)
                .IsRequired()
                .HasMaxLenght(50);

            entity.Property(p => p.Category)
                .IsRequired()
                .HasMaxLenght(100);

            entity.Property(p => p.Price)
                .HasColumnType("decimal(18,2)");

            entity.HasIndex(p => p.SKU)
                .IsUnique()
                .HasDatabaseName("IX_Products_SKU");
        });
    }
}
