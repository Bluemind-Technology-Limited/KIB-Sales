import type { UserRole } from '../types/domain';

/** Role home for a signed-in user; Super Admin lands on the admin dashboard. */
export function roleHome(role: UserRole | undefined): string {
  return role === 'DISTRIBUTOR' ? '/distributor' : '/admin';
}
