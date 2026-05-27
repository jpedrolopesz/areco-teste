import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Nome obrigatorio").max(200),
  sku: z.string().min(1, "SKU obrigatorio").max(50),
  category: z.string().min(1, "SKU obrigatorio").max(100),
  price: z.coerce
    .number({ invalid_type_error: "Preço invalido" })
    .positive("Preço deve ser maior que zero"),
  stock: z.coerce
    .number({ invalid_type_error: "Estoque invalido" })
    .int()
    .min(0, "Estoque nao pode ser negativo"),
});

export type ProductSchema = z.infer<typeof productSchema>;
