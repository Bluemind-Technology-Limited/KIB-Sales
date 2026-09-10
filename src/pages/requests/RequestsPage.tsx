import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ClipboardText } from 'iconsax-reactjs';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  loadRequests,
  openRequest,
  reviewRequest,
  clearSelected,
  clearRequestError,
  selectRequests,
  selectRequestsStatus,
  selectSelectedRequest,
  selectReviewingId,
  selectRequestError,
} from '../../store/slices/requestSlice';
import { selectUser } from '../../store/slices/authSlice';
import { useRequestRealtime } from '../../hooks/useRequestRealtime';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Alert } from '../../components/ui/Alert';
import { StatusBadge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { RequestDetail } from '../../components/requests/RequestDetail';
import { Paginator } from '../../components/ui/Paginator';
import { usePagination } from '../../hooks/usePagination';
import { formatCurrency, timeAgo } from '../../utils/format';

const PAGE_SIZE = 10;

type Filter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Request board shared by both roles. The Super Admin sees every request
 * across all distributors (with a distributor column); a distributor sees
 * only their own channel's requests.
 */
export function RequestsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const requests = useAppSelector(selectRequests);
  const status = useAppSelector(selectRequestsStatus);
  const selected = useAppSelector(selectSelectedRequest);
  const reviewingId = useAppSelector(selectReviewingId);
  const error = useAppSelector(selectRequestError);

  const isAdmin = user?.role === 'SUPER_ADMIN';

  useRequestRealtime();

  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = (searchParams.get('filter') ?? 'ALL') as Filter;
  const filter: Filter = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'].includes(filterParam)
    ? filterParam
    : 'ALL';
  const [dismissedError, setDismissedError] = useState(false);

  const setFilter = (f: Filter) => {
    const next = new URLSearchParams(searchParams);
    if (f === 'ALL') next.delete('filter');
    else next.set('filter', f);
    setSearchParams(next, { replace: true });
  };

  const load = useCallback(() => {
    // GET /api/requests is role-filtered server-side — no id needed.
    dispatch(loadRequests());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setDismissedError(false);
  }, [status]);

  const handleReview = (id: string, decisionStatus: 'APPROVED' | 'REJECTED', notes?: string) => {
    dispatch(reviewRequest({ id, decision: { status: decisionStatus, reviewNote: notes } }));
  };

  const filtered = requests.filter((r) => filter === 'ALL' || r.status === filter);
  const pagination = usePagination(PAGE_SIZE, filtered.length, filter);
  const paged = pagination.slice(filtered);
  const loading = status === 'loading';
  const showError = status === 'failed' && !dismissedError;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? 'All Requests' : 'Product Requests'}
        subtitle={
          isAdmin
            ? 'View and manage product requests across all distributors and sales users.'
            : 'Approve or reject requests submitted by your assigned sales team.'
        }
      />

      {showError && (
        <Alert
          message={error || 'Failed to load requests.'}
          onDismiss={() => {
            setDismissedError(true);
            dispatch(clearRequestError());
          }}
        />
      )}

      <div className="flex flex-wrap gap-2">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`h-8 px-3.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
              filter === f
                ? 'bg-[#171717] text-white border-[#171717]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === 'ALL' ? 'All' : f.toLowerCase()}
          </button>
        ))}
      </div>

      {status === 'failed' ? (
        <div className="bg-white border border-[#E9E9E9] rounded-xl overflow-hidden">
          <ErrorState title="Could not load requests" message={error || 'Something went wrong.'} onRetry={load} />
        </div>
      ) : loading ? (
        <TableSkeleton cols={6} rows={6} hasAvatar />
      ) : (
        <div className="bg-white border border-[#E9E9E9] rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState
              title="No requests found"
              hint={isAdmin ? 'No requests match the current filter.' : 'Requests from your sales team will appear here.'}
            />
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3 font-semibold">Sales User</th>
                    {isAdmin && <th className="px-4 py-3 font-semibold">Distributor</th>}
                    <th className="px-4 py-3 font-semibold">Items</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Submitted</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">View</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((req) => (
                    <tr
                      key={req.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer"
                      onClick={() => dispatch(openRequest(req.id))}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={req.salesUserName} size="sm" />
                          <p className="text-xs font-bold text-[#171717] leading-none">{req.salesUserName}</p>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-600 max-w-[160px] truncate block">{req.distributorName}</span>
                        </td>
                      )}
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {req.items.length} {isAdmin ? 'item' : 'product'}{req.items.length === 1 ? '' : 's'}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-[#171717]">{formatCurrency(req.totalAmount)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{timeAgo(req.createdAt)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#EA4335]">
                          <ClipboardText size={14} /> Review
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <Paginator
                page={pagination.page}
                pageCount={pagination.pageCount}
                pageSize={PAGE_SIZE}
                total={pagination.total}
                onChange={pagination.onPageChange}
              />
            </>
          )}
        </div>
      )}

      <AnimatePresence>
      {selected && (
        <Modal onClose={() => dispatch(clearSelected())} maxWidth="max-w-2xl">
          <div className="kib-scroll bg-white rounded-2xl w-full p-6 max-h-[85vh] overflow-y-auto overscroll-contain">
            <RequestDetail
              request={selected}
              reviewing={reviewingId === selected.id}
              onReview={(decisionStatus, notes) => handleReview(selected.id, decisionStatus, notes)}
              showDistributor={isAdmin}
            />
            <div className="flex justify-end mt-5">
              <button
                type="button"
                onClick={() => dispatch(clearSelected())}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
      </AnimatePresence>
    </div>
  );
}
