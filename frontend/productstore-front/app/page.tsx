"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product, ProductFormData } from "../types";
import { api } from "../lib/api";
import { productSchema } from "@/lib/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function ProductsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, pageSize],
    queryFn: () => api.list(page, pageSize),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => api.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setCreating(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductFormData }) =>
      api.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setEditing(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const openEdit = (product: Product) => {
    setEditing(product);
    reset({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      stock: product.stock,
    });
  };

  const closeModal = () => {
    setCreating(false);
    setEditing(null);
    reset();
  };

  const onSubmit = (data: ProductFormData) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isModalOpen = creating || editing !== null;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Produtos</h1>
          <p className="text-sm text-gray-500">Gestão de estoque e catálogo</p>
        </div>
        <button
          onClick={() => {
            setCreating(true);
            reset();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50"
        >
          + Novo Produto
        </button>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              {["Nome", "SKU", "Categoria", "Preço", "Estoque", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  Carregando...
                </td>
              </tr>
            )}
            {data?.data.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 font-mono text-gray-500 text-xs">
                  {p.sku}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-blue-500 text-xs bg-blue-50 px-2 py-0.5 rounded">
                    {p.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {p.price.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      p.stock === 0
                        ? "text-red-500"
                        : p.stock <= 10
                          ? "text-yellow-500"
                          : ""
                    }
                  >
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-gray-400 hover:text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-100"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(p.id)}
                      disabled={deleteMutation.isPending}
                      className="text-gray-400 hover:text-red-500 text-xs px-2 py-1 rounded hover:bg-red-50"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>
            {data.totalCount} produto{data.totalCount !== 1 ? "s" : ""} · página{" "}
            {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              ‹ Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`px-3 py-1 rounded border ${
                  page === n
                    ? "border-blue-300 bg-blue-50 text-blue-600"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              Próxima ›
            </button>
          </div>
        </div>
      )}

      {/* Modal (criar / editar) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-base font-semibold mb-4">
              {editing ? "Editar Produto" : "Novo Produto"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nome</label>
                <input
                  {...register("name")}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">SKU</label>
                <input
                  {...register("sku")}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                {errors.sku && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sku.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Categoria
                </label>
                <input
                  {...register("category")}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Preço (R$)
                  </label>
                  <input
                    {...register("price")}
                    type="number"
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.price.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Estoque
                  </label>
                  <input
                    {...register("stock")}
                    type="number"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                  {errors.stock && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.stock.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                  {editing ? "Salvar" : "Criar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
