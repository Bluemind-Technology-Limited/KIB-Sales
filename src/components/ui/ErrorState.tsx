import { InfoCircle, Refresh } from 'iconsax-reactjs';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/** Dedicated error-state block — used whenever an operation/page enters an error state. */
export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this data. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
      <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3">
        <InfoCircle size={20} className="text-rose-600" variant="Bold" />
      </div>
      <p className="text-sm font-bold text-text">{title}</p>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 h-9 px-4 rounded-[var(--radius-control)] border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 transition-colors cursor-pointer bg-surface focus-native"
        >
          <Refresh size={14} className="text-slate-500" />
          Retry
        </button>
      )}
    </div>
  );
}
