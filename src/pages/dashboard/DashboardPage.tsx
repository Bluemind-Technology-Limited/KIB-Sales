import { useCallback, useEffect, useState } from 'react';
import { ArrowRight2, Box1, Buildings2, ClipboardText, CloseCircle, DirectboxReceive, Profile2User, TickCircle } from 'iconsax-reactjs';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { selectUser } from '../../store/slices/authSlice';
import { loadRequests, selectRequests, selectRequestsStatus } from '../../store/slices/requestSlice';
import { useRequestRealtime } from '../../hooks/useRequestRealtime';
import { fetchAdminMetrics, fetchDistributorMetrics } from '../../services/dashboardService';
import type { AdminMetrics, DashboardMetrics } from '../../types/domain';
import { PageHeader } from '../../components/ui/PageHeader';
import { MetricCard } from '../../components/ui/MetricCard';
import { MetricSkeleton, Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { StatusBadge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { formatCurrency, timeAgo } from '../../utils/format';

/** Role-aware overview: platform metrics (admin) or channel metrics (distributor). */
export function DashboardPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const requests = useAppSelector(selectRequests);
  const requestStatus = useAppSelector(selectRequestsStatus);

  const isAdmin = user?.role === 'SUPER_ADMIN';
  const [metrics, setMetrics] = useState<AdminMetrics | DashboardMetrics | null>(null);
  const [metricsError, setMetricsError] = useState(false);
  const [metricsKey, setMetricsKey] = useState(0);

  useRequestRealtime();

  const load = useCallback(() => {
    // GET /api/requests is role-filtered server-side — no id needed.
    dispatch(loadRequests());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let active = true;
    if (!user?.id) return;
    setMetrics(null);
    setMetricsError(false);
    const promise = isAdmin
      ? fetchAdminMetrics()
      : fetchDistributorMetrics(user.id);
    promise
      .then((m) => {
        if (active) setMetrics(m);
      })
      .catch(() => {
        if (active) setMetricsError(true);
      });
    return () => {
      active = false;
    };
  }, [isAdmin, user?.id, metricsKey]);

  const recent = [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const requestsHref = isAdmin ? '/admin/requests' : '/distributor/requests';

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.fullName?.split(' ')[0] || (isAdmin ? 'Admin' : 'Distributor')}`}
        subtitle={
          isAdmin
            ? 'Complete visibility and control over the sales force automation platform.'
            : 'Review product requests from your assigned sales team.'
        }
      />

      {metricsError && !metrics && (
        <div className="bg-white border border-[#E9E9E9] rounded-xl">
          <ErrorState title="Could not load metrics" onRetry={() => setMetricsKey((k) => k + 1)} />
        </div>
      )}

      {!metrics && !metricsError ? (
        <MetricSkeleton count={isAdmin ? 6 : 4} />
      ) : (
        metrics && (
          isAdmin ? (
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-2.5 md:gap-4">
              <MetricCard label="Distributors" icon={<Buildings2 size={16} className="text-[#EA4335]" />} value={(metrics as AdminMetrics).totalDistributors} sub="on platform" />
              <MetricCard label="Sales Users" icon={<Profile2User size={16} className="text-sky-600" />} value={metrics.totalSales} sub="active reps" />
              <MetricCard label="Products" icon={<Box1 size={16} className="text-violet-600" />} value={(metrics as AdminMetrics).totalProducts} sub="catalogue" />
              <MetricCard label="Pending Requests" icon={<DirectboxReceive size={16} className="text-amber-600" />} value={metrics.pendingRequests} sub="awaiting review" />
              <MetricCard label="Approved" icon={<TickCircle size={16} className="text-emerald-600" />} value={metrics.approvedRequests} sub="fulfilled" />
              <MetricCard label="Rejected" icon={<CloseCircle size={16} className="text-rose-600" />} value={metrics.rejectedRequests} sub="declined" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-2.5 md:gap-4">
              <MetricCard label="Sales Team" icon={<Profile2User size={16} className="text-[#EA4335]" />} value={metrics.totalSales} sub="assigned" />
              <MetricCard label="Pending Requests" icon={<DirectboxReceive size={16} className="text-amber-600" />} value={metrics.pendingRequests} sub="awaiting review" />
              <MetricCard label="Approved" icon={<TickCircle size={16} className="text-emerald-600" />} value={metrics.approvedRequests} sub="fulfilled" />
              <MetricCard label="Rejected" icon={<CloseCircle size={16} className="text-rose-600" />} value={metrics.rejectedRequests} sub="declined" />
            </div>
          )
        )
      )}

      {/* Recent requests */}
      <div className="bg-white border border-[#E9E9E9] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#E9E9E9]">
          <div className="flex items-center gap-2">
            <ClipboardText size={16} className="text-[#EA4335]" />
            <span className="text-xs font-semibold text-[#737373]">Recent Requests</span>
          </div>
          <Link to={requestsHref} className="text-xs font-semibold text-[#EA4335] flex items-center gap-1 hover:underline">
            View all <ArrowRight2 size={12} />
          </Link>
        </div>

        {requestStatus === 'loading' ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            {isAdmin ? 'No requests yet.' : 'No requests yet. Your sales team has not submitted any requests.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recent.map((req) => (
              <Link key={req.id} to={requestsHref} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={req.salesUserName} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#171717] leading-tight truncate">{req.salesUserName}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {isAdmin
                        ? `${req.distributorName} · ${req.items.length} item${req.items.length === 1 ? '' : 's'} · ${formatCurrency(req.totalAmount)}`
                        : `${req.items.length} product${req.items.length === 1 ? '' : 's'} · ${formatCurrency(req.totalAmount)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-slate-400 hidden sm:inline">{timeAgo(req.createdAt)}</span>
                  <StatusBadge status={req.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
