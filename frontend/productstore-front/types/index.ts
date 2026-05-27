export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResult<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: T[];
}
export interface ProductFormData {
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
}
