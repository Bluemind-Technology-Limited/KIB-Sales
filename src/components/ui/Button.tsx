import type { ReactNode } from 'react';
import { Add } from 'iconsax-reactjs';
import { Tooltip } from './Tooltip';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  withPlusIcon?: boolean;
  tooltip?: string;
  setTooltipSide?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

/** Reusable button. primary = KIB 3D red, secondary = bordered, danger = destructive. */
export function Button({
  children,
  onClick,
  type = 'button',
  disabled,
  variant = 'primary',
  size = 'md',
  fullWidth,
  withPlusIcon,
  tooltip,
  setTooltipSide = 'top',
  className = '',
}: ButtonProps) {
  const sizeClass = size === 'sm' ? 'h-8 px-3 text-xs' : 'h-9 px-4 text-xs';
  const widthClass = fullWidth ? 'w-full sm:w-auto' : '';

  const inner =
    variant === 'secondary' ? (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${sizeClass} ${widthClass} border border-slate-200 bg-surface hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-[var(--radius-control)] text-xs font-semibold text-slate-700 inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors focus-native ${className}`}
      >
        {children}
      </button>
    ) : variant === 'danger' ? (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${sizeClass} ${widthClass} border border-rose-600 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-[var(--radius-control)] text-xs font-semibold text-white inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors focus-native ${className}`}
      >
        {children}
      </button>
    ) : (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`btn-3d ${sizeClass} ${widthClass} ${className}`}
      >
        <span className="flex items-center gap-1.5 text-white text-xs font-semibold">
          {withPlusIcon && <Add size={14} />}
          {children}
        </span>
      </button>
    );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} side={setTooltipSide}>
        {inner}
      </Tooltip>
    );
  }
  return inner;
}
