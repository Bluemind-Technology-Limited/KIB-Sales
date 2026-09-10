import type { ProductRequest, RequestStatus } from '../types/domain';
import { apiFetch } from './api';
import { asArray, mapRequest } from './mappers';

export interface ReviewDecision {
  status: Exclude<RequestStatus, 'PENDING'>;
  reviewNote?: string;
}

/**
 * Requests via the Express API. GET /api/requests is role-filtered
 * server-side, so a distributor only ever receives their own channel's
 * requests; the optional id is accepted for signature parity with the store.
 */
export const requestService = {
  async list(_distributorId?: string): Promise<ProductRequest[]> {
    void _distributorId; // GET /api/requests is role-filtered server-side
    const data = await apiFetch<unknown>('/api/requests');
    return asArray(data).map(mapRequest);
  },

  async getById(id: string): Promise<ProductRequest | undefined> {
    const data = await apiFetch<Record<string, unknown>>(`/api/requests/${id}`);
    return data ? mapRequest(data) : undefined;
  },

  /** Approve or reject a request (PATCH /api/requests/:id/review). */
  async review(id: string, decision: ReviewDecision): Promise<ProductRequest> {
    const data = await apiFetch<Record<string, unknown>>(`/api/requests/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status: decision.status, reviewNote: decision.reviewNote }),
    });
    return mapRequest(data ?? {});
  },
};
