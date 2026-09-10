import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import { selectUser } from '../store/slices/authSlice';

/** Redirects unauthenticated users to login, preserving the intended route. */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAppSelector(selectUser);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
