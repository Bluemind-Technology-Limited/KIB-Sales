import { ArrowLeft2, ArrowRight2 } from 'iconsax-reactjs';

interface PaginatorProps {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

function pageList(current: number, pageCount: number): (number | '\u2026')[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages: (number | '\u2026')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(pageCount - 1, current + 1);
  if (start > 2) pages.push('\u2026');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < pageCount - 1) pages.push('\u2026');
  pages.push(pageCount);
  return pages;
}

/** Compact bottom-of-table pagination: page numbers + prev/next + record range. */
export function Paginator({ page, pageCount, total, pageSize, onChange }: PaginatorProps) {
  if (pageCount <= 1) return null;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#E9E9E9]">
      <p className="text-[11px] text-slate-500">
        Showing <span className="font-semibold text-slate-700">{from}–{to}</span> of{' '}
        <span className="font-semibold text-slate-700">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#EA4335] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ArrowLeft2 size={14} />
        </button>
        {pageList(page, pageCount).map((p, i) =>
          p === '\u2026' ? (
            <span key={`e${i}`} className="px-1 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={`h-7 min-w-7 px-1.5 flex items-center justify-center rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                p === page
                  ? 'bg-[#EA4335] text-white'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#EA4335]'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
          className="h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#EA4335] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ArrowRight2 size={14} />
        </button>
      </div>
    </div>
  );
}
