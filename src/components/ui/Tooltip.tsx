import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  children: ReactNode;
  className?: string;
}

const GAP = 8;

/**
 * Hover tooltip rendered through a portal into `document.body`, so it is never
 * clipped by `overflow-hidden` table cards or other containers. Position is
 * computed from the wrapped element's and the tooltip's own measured sizes, and
 * flips when near the viewport edge.
 */
export function Tooltip({ content, side = 'top', children, className }: TooltipProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({ visibility: 'hidden' });

  const place = () => {
    const el = wrapRef.current;
    const tip = tipRef.current;
    if (!el || !tip) return;
    const rect = el.getBoundingClientRect();
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let chosen = side;
    if (chosen === 'right' && rect.right + tw + GAP > vw) chosen = 'left';
    else if (chosen === 'left' && rect.left - tw - GAP < 0) chosen = 'right';
    else if (chosen === 'bottom' && rect.bottom + th + GAP > vh) chosen = 'top';
    else if (chosen === 'top' && rect.top - th - GAP < 0) chosen = 'bottom';

    let next: CSSProperties;
    if (chosen === 'right') {
      next = { left: rect.right + GAP, top: rect.top + rect.height / 2, transform: 'translateY(-50%)' };
    } else if (chosen === 'left') {
      next = { left: rect.left - tw - GAP, top: rect.top + rect.height / 2, transform: 'translateY(-50%)' };
    } else if (chosen === 'bottom') {
      next = { top: rect.bottom + GAP, left: rect.left + rect.width / 2, transform: 'translateX(-50%)' };
    } else {
      next = { top: rect.top - th - GAP, left: rect.left + rect.width / 2, transform: 'translateX(-50%)' };
    }
    setStyle(next);
  };

  useLayoutEffect(() => {
    if (!open) return;
    const onAny = () => place();
    onAny();
    window.addEventListener('scroll', onAny, true);
    window.addEventListener('resize', onAny);
    return () => {
      window.removeEventListener('scroll', onAny, true);
      window.removeEventListener('resize', onAny);
    };
  }, [open, side]);

  return (
    <span
      ref={wrapRef}
      className={`relative inline-block ${className ?? ''}`}
      onMouseEnter={() => {
        if (window.matchMedia('(min-width: 768px)').matches) setOpen(true);
      }}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => {
        if (window.matchMedia('(min-width: 768px)').matches) setOpen(true);
      }}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open &&
        createPortal(
          <span
            ref={tipRef}
            role="tooltip"
            style={style}
            className="pointer-events-none fixed z-[9999] whitespace-nowrap rounded-md bg-[#171717] text-white text-[11px] font-medium px-2 py-1 shadow-lg"
          >
            {content}
          </span>,
          document.body
        )}
    </span>
  );
}
