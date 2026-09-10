import { useState } from 'react';
import { Buildings2, CloseCircle, DocumentText, TickCircle } from 'iconsax-reactjs';
import type { ProductRequest } from '../../types/domain';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { StatusBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

type RejectionReason = { value: string };

const REJECTION_PRESETS: RejectionReason[] = [
  { value: 'Out of stock' },
  { value: 'Incorrect quantity' },
  { value: 'Discontinued product' },
  { value: 'Pricing discrepancy' },
  { value: 'Insufficient details' },
];

interface RequestDetailProps {
  request: ProductRequest;
  reviewing: boolean;
  onReview: (status: 'APPROVED' | 'REJECTED', notes?: string) => void;
  showReview?: boolean;
  /** Show the responsible distributor line (hidden in the distributor's own view). */
  showDistributor?: boolean;
}

/**
 * Full breakdown of a single product request: submitter, items, quantities,
 * amounts and the approve / reject controls. The Super Admin sees the
 * responsible distributor as well.
 */
export function RequestDetail({ request, reviewing, onReview, showReview = true, showDistributor = true }: RequestDetailProps) {
  const [rejectionNote, setRejectionNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const isPending = request.status === 'PENDING';

  const applyPreset = (value: string) => setRejectionNote(value);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={request.salesUserName} />
          <div>
            <p className="text-sm font-bold text-[#171717] leading-none">{request.salesUserName}</p>
            <p className="text-xs text-slate-500 mt-1">Submitted {formatDateTime(request.createdAt)}</p>
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <DocumentText size={14} />
          <span className="font-mono font-semibold text-slate-700">{request.id.toUpperCase()}</span>
        </span>
        {showDistributor && request.distributorName && (
          <>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span className="flex items-center gap-1.5">
              <Buildings2 size={14} />
              <span>{request.distributorName}</span>
            </span>
          </>
        )}
      </div>

      <div className="border border-[#E9E9E9] rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 bg-slate-50/50">
              <th className="px-4 py-2.5 font-semibold">Product</th>
              <th className="px-4 py-2.5 font-semibold">Unit</th>
              <th className="px-4 py-2.5 font-semibold text-right">Qty</th>
              <th className="px-4 py-2.5 font-semibold text-right">Price</th>
              <th className="px-4 py-2.5 font-semibold text-right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {request.items.map((item) => (
              <tr key={item.productId} className="border-b border-slate-50 hover:bg-slate-50/40">
                <td className="px-4 py-3 text-xs font-semibold text-[#171717]">{item.productName}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{item.unit}</td>
                <td className="px-4 py-3 text-xs text-slate-700 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-xs text-slate-500 text-right">{formatCurrency(item.price)}</td>
                <td className="px-4 py-3 text-xs font-semibold text-[#171717] text-right">
                  {formatCurrency(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500">Total</span>
          <span className="text-sm font-bold text-[#171717]">{formatCurrency(request.totalAmount)}</span>
        </div>
      </div>

      {request.status === 'REJECTED' && request.notes && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          <span className="font-semibold">Reason: </span>
          {request.notes}
        </div>
      )}

      {isPending && showReview && (
        <div className="border-t border-[#E9E9E9] pt-4">
          {!showRejectForm ? (
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-end">
              <Button variant="danger" onClick={() => setShowRejectForm(true)} disabled={reviewing}>
                Reject
              </Button>
              <Button
                onClick={() => onReview('APPROVED')}
                disabled={reviewing}
              >
                <span className="flex items-center gap-1.5 text-white text-xs font-semibold">
                  <TickCircle size={14} variant="Bold" /> Approve Request
                </span>
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onReview('REJECTED', rejectionNote || 'Request rejected.');
              }}
              className="flex flex-col gap-3"
            >
              <label className="text-xs font-semibold text-[#171717]">
                Reason for rejection <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {REJECTION_PRESETS.map((preset) => {
                  const active = rejectionNote === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => applyPreset(preset.value)}
                      className={`text-[11px] font-medium rounded-lg border px-2.5 py-1 transition-colors cursor-pointer ${
                        active
                          ? 'bg-rose-50 border-[#EA4335] text-[#EA4335]'
                          : 'border-[#E9E9E9] text-slate-500 hover:border-[#EA4335] hover:text-[#EA4335]'
                      }`}
                    >
                      {preset.value}
                    </button>
                  );
                })}
              </div>
              <textarea
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                rows={2}
                placeholder="Or type your own reason…"
                className="w-full rounded-lg border border-[#E9E9E9] px-3 py-2 text-xs focus:outline-none focus:border-[#EA4335] resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowRejectForm(false)} type="button">
                  Cancel
                </Button>
                <Button type="submit" variant="danger" disabled={reviewing}>
                  <span className="flex items-center gap-1.5 text-white text-xs font-semibold">
                    <CloseCircle size={14} /> Reject
                  </span>
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {!isPending && request.reviewedAt && (
        <p className="text-[11px] text-slate-400 text-right">Reviewed {formatDateTime(request.reviewedAt)}</p>
      )}
    </div>
  );
}
