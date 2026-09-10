import { useEffect } from 'react';
import { CloseCircle, InfoCircle } from 'iconsax-reactjs';

interface AlertProps {
  message: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}

/** Inline error banner with auto-dismiss. */
export function Alert({ message, onDismiss, autoDismissMs = 6000 }: AlertProps) {
  useEffect(() => {
    if (!autoDismissMs) return;
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [onDismiss, autoDismissMs]);

  return (
    <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 flex items-start gap-2">
      <InfoCircle size={16} className="text-rose-600 shrink-0 mt-0.5" variant="Bold" />
      <p className="flex-1">{message}</p>
      <button type="button" onClick={onDismiss} aria-label="Dismiss" className="text-rose-400 hover:text-rose-700 shrink-0 cursor-pointer">
        <CloseCircle size={15} />
      </button>
    </div>
  );
}
