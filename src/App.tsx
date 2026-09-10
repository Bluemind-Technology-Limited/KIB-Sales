import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RequireRole } from './routes/RequireRole';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { DistributorsPage } from './pages/distributors/DistributorsPage';
import { SalesUsersPage } from './pages/sales-users/SalesUsersPage';
import { ProductsPage } from './pages/products/ProductsPage';
import { RequestsPage } from './pages/requests/RequestsPage';
import { SalesTeamPage } from './pages/sales-team/SalesTeamPage';
import { useAppSelector } from './hooks/redux';
import { selectUser } from './store/slices/authSlice';
import { roleHome } from './routes/roles';

/**
 * Root routes for the merged KIB SFA app. One app, two role-scoped areas:
 * `/admin/*` for the Super Admin and `/distributor/*` for distributors.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomeRedirect />} />
      <Route
        element={
          <ProtectedRoute>
            <RequireRole role="SUPER_ADMIN">
              <AppShell />
            </RequireRole>
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/distributors" element={<DistributorsPage />} />
        <Route path="/admin/sales-users" element={<SalesUsersPage />} />
        <Route path="/admin/products" element={<ProductsPage />} />
        <Route path="/admin/requests" element={<RequestsPage />} />
      </Route>
      <Route
        element={
          <ProtectedRoute>
            <RequireRole role="DISTRIBUTOR">
              <AppShell />
            </RequireRole>
          </ProtectedRoute>
        }
      >
        <Route path="/distributor" element={<DashboardPage />} />
        <Route path="/distributor/sales-team" element={<SalesTeamPage />} />
        <Route path="/distributor/requests" element={<RequestsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/** Sends signed-in users to their role home; guests go to the login screen. */
function HomeRedirect() {
  const user = useAppSelector(selectUser);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleHome(user.role)} replace />;
}
