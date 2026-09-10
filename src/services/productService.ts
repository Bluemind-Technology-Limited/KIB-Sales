import type { Product } from '../types/domain';
import { apiFetch } from './api';
import { asArray, mapProduct } from './mappers';

export interface ProductInput {
  name: string;
  sku: string;
  description: string;
  unit: string;
  price: number;
  stock: number;
}

/**
 * Product catalogue via the Express API. The backend model only stores
 * name/sku/description/unit/isActive — `price` and `stock` are frontend-only
 * until the backend adds them, so they are not sent in create/update payloads.
 */
export const productService = {
  /** Admin list — includes inactive products via ?includeInactive=true. */
  async list(): Promise<Product[]> {
    const data = await apiFetch<unknown>('/api/products?includeInactive=true');
    return asArray(data).map(mapProduct);
  },

  async create(input: ProductInput): Promise<Product> {
    const data = await apiFetch<Record<string, unknown>>('/api/products', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        sku: input.sku,
        description: input.description,
        unit: input.unit,
      }),
    });
    return mapProduct(data ?? {});
  },

  async update(id: string, input: Partial<ProductInput>): Promise<Product> {
    const data = await apiFetch<Record<string, unknown>>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: input.name,
        sku: input.sku,
        description: input.description,
        unit: input.unit,
      }),
    });
    return mapProduct(data ?? {});
  },

  /** Deactivate a product (DELETE is the documented deactivation verb). */
  async toggleActive(id: string): Promise<Product> {
    const data = await apiFetch<Record<string, unknown>>(`/api/products/${id}`, {
      method: 'DELETE',
    });
    return mapProduct(data ?? {});
  },
};
