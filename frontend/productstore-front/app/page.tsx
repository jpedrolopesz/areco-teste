"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product, ProductFormData } from "../types";
import { api } from "../lib/api";
import { productSchema } from "@/lib/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

type ModalMode = "create" | "edit";

export default function ProductsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);

  const PAGE_SIZE = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["products", page],
    queryFn: () => api.list(page, PAGE_SIZE),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({ resolver: zodResolver(productSchema) });

  const getApiErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    return "Ocorreu um erro inesperado.";
  };

  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => api.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      closeModal();
      toast.success("Produto criado com sucesso.");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductFormData }) =>
      api.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      closeModal();
      toast.success("Produto atualizado.");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto excluído.");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const openCreate = () => {
    reset();
    setEditing(null);
    setModalMode("create");
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    reset({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      stock: product.stock,
    });
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
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

  const totalPages = data?.totalPages ?? 1;
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Produtos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestão de estoque e catálogo
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          + Novo Produto
        </button>
      </div>

      {/* Tabela */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
            <tr>
              {["Nome", "SKU", "Categoria", "Preço", "Estoque", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12 text-gray-400 dark:text-gray-500"
                >
                  Carregando...
                </td>
              </tr>
            ) : (
              data?.data.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 bg-white dark:bg-gray-900"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400 text-xs">
                    {p.sku}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-blue-500 dark:text-blue-400 text-xs bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
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
                            : "text-gray-700 dark:text-gray-300"
                      }
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(p.id)}
                        disabled={deleteMutation.isPending}
                        className="text-gray-400 hover:text-red-500 text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-40"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
          <span>
            {data.totalCount} produto{data.totalCount !== 1 ? "s" : ""} · página{" "}
            {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              ‹ Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`px-3 py-1 rounded border ${
                  page === n
                    ? "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                    : "border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Próxima ›
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalMode && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {modalMode === "edit" ? "Editar Produto" : "Novo Produto"}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Field label="Nome" error={errors.name?.message}>
                <input {...register("name")} className={inputCls} />
              </Field>

              <Field label="SKU" error={errors.sku?.message}>
                <input {...register("sku")} className={inputCls} />
              </Field>

              <Field label="Categoria">
                <input {...register("category")} className={inputCls} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Preço (R$)" error={errors.price?.message}>
                  <input
                    {...register("price")}
                    type="number"
                    step="0.01"
                    className={inputCls}
                  />
                </Field>
                <Field label="Estoque" error={errors.stock?.message}>
                  <input
                    {...register("stock")}
                    type="number"
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-60"
                >
                  {isPending
                    ? "Salvando..."
                    : modalMode === "edit"
                      ? "Salvar"
                      : "Criar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const inputCls =
  "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
