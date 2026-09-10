import type { Product, User } from '../types/domain';
import { apiFetch } from './api';
import { asArray, mapProduct, mapUser } from './mappers';

export type SalesMember = User;

/** Distributor-scoped views via the Express API. */
export const salesTeamService = {
  /** Sales users assigned to a distributor (GET /api/distributors/:id/sales-users). */
  async list(distributorId: string): Promise<SalesMember[]> {
    const data = await apiFetch<unknown>(`/api/distributors/${distributorId}/sales-users`);
    return asArray(data).map(mapUser);
  },

  /** Active product catalogue (GET /api/products). */
  async products(): Promise<Product[]> {
    const data = await apiFetch<unknown>('/api/products');
    return asArray(data).map(mapProduct);
  },
};
