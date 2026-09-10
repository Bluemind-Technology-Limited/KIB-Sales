import { statusBadge } from '../../constants/theme';
import { capitalize } from '../../utils/format';

interface BadgeProps {
  status: string;
  className?: string;
}

/** Semantic status pill. */
export function StatusBadge({ status, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
        statusBadge[status] || statusBadge.INACTIVE
      } ${className}`}
    >
      {status === 'REJECTED' ? 'Rejected' : status ? capitalize(status) : '—'}
    </span>
  );
}
