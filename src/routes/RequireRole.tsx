import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import { selectUser } from '../store/slices/authSlice';
import type { UserRole } from '../types/domain';
import { roleHome } from './roles';

/**
 * Guards a role-scoped area (e.g. `/admin/*`). Authentication is handled by
 * ProtectedRoute; this component redirects a signed-in user of the wrong role
 * to their own dashboard.
 */
export function RequireRole({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const user = useAppSelector(selectUser);

  if (user && user.role !== role) {
    return <Navigate to={roleHome(user.role)} replace />;
  }
  return <>{children}</>;
}
