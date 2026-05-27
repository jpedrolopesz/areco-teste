import { PagedResult, Product, ProductFormData } from "../types";

const BASE = "http://localhost:5062/api";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(err.error ?? "Erro na requisiçao");
  }

  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = {
  list: (page: number, pageSize: number) =>
    req<PagedResult<Product>>(`/products?page=${page}&pageSize=${pageSize}`),
  get: (id: number) => req<Product>(`/products/${id}`),
  create: (data: ProductFormData) =>
    req<Product>("/products", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: ProductFormData) =>
    req<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => req<void>(`/products/${id}`, { method: "DELETE" }),
};
