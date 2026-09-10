import type { User } from '../types/domain';
import { apiFetch } from './api';
import { asArray, mapUser } from './mappers';

export interface SalesUserInput {
  /** Supabase auth user id — required on create; the backend does not provision auth accounts. */
  authId?: string;
  name: string;
  email: string;
  phone?: string;
  distributorId: string | null;
}

/** Sales user management via the Express API (Super Admin). */
export const salesUserService = {
  async list(): Promise<User[]> {
    const data = await apiFetch<unknown>('/api/users?role=SALES');
    return asArray(data).map(mapUser);
  },

  async create(input: SalesUserInput): Promise<User> {
    const data = await apiFetch<Record<string, unknown>>('/api/users', {
      method: 'POST',
      body: JSON.stringify({
        authId: input.authId,
        email: input.email,
        name: input.name,
        role: 'SALES',
        phone: input.phone,
        distributorId: input.distributorId,
      }),
    });
    return mapUser(data ?? {});
  },

  async update(id: string, input: Partial<SalesUserInput>): Promise<User> {
    const data = await apiFetch<Record<string, unknown>>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        phone: input.phone,
        distributorId: input.distributorId,
      }),
    });
    return mapUser(data ?? {});
  },

  /** Deactivate a sales user (DELETE is the documented deactivation verb). */
  async toggleActive(id: string): Promise<User> {
    const data = await apiFetch<Record<string, unknown>>(`/api/users/${id}`, {
      method: 'DELETE',
    });
    return mapUser(data ?? {});
  },

  async assignDistributor(id: string, distributorId: string | null): Promise<User> {
    const data = await apiFetch<Record<string, unknown>>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ distributorId }),
    });
    return mapUser(data ?? {});
  },
};
