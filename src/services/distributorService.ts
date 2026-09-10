import type { Distributor } from '../types/domain';
import { apiFetch } from './api';
import { asArray, mapDistributor } from './mappers';

export interface DistributorInput {
  name: string;
  email: string;
  phone: string;
  location: string;
  address: string;
}

/** CRUD for distributors via the Express API (Super Admin). */
export const distributorService = {
  async list(): Promise<Distributor[]> {
    const data = await apiFetch<unknown>('/api/distributors');
    return asArray(data).map(mapDistributor);
  },

  async create(input: DistributorInput): Promise<Distributor> {
    const data = await apiFetch<Record<string, unknown>>('/api/distributors', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return mapDistributor(data ?? {});
  },

  async update(id: string, input: Partial<DistributorInput>): Promise<Distributor> {
    const data = await apiFetch<Record<string, unknown>>(`/api/distributors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    return mapDistributor(data ?? {});
  },

  /** Deactivate a distributor (DELETE is the documented deactivation verb). */
  async toggleActive(id: string): Promise<Distributor> {
    const data = await apiFetch<Record<string, unknown>>(`/api/distributors/${id}`, {
      method: 'DELETE',
    });
    return mapDistributor(data ?? {});
  },

  async salesCount(id: string): Promise<number> {
    const data = await apiFetch<unknown>(`/api/distributors/${id}/sales-users`);
    return asArray(data).length;
  },
};
