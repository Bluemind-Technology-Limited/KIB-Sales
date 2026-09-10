import type { AdminMetrics, DashboardMetrics } from '../types/domain';
import { apiFetch } from './api';
import { mapAdminMetrics, mapDashboardMetrics } from './mappers';

/** Platform-wide dashboard stats for the Super Admin (GET /api/dashboard). */
export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const data = await apiFetch<Record<string, unknown>>('/api/dashboard');
  return mapAdminMetrics(data ?? {});
}

/**
 * Dashboard stats scoped to a distributor (GET /api/dashboard is
 * role-filtered server-side, so the id is only passed for signature parity).
 */
export async function fetchDistributorMetrics(_distributorId: string): Promise<DashboardMetrics> {
  void _distributorId; // /api/dashboard is role-filtered server-side; id is for signature parity
  const data = await apiFetch<Record<string, unknown>>('/api/dashboard');
  return mapDashboardMetrics(data ?? {});
}
