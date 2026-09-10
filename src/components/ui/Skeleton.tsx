const shimmer = `
  @keyframes kib-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .kib-skeleton {
    background: linear-gradient(90deg, #F1F1F1 25%, #E8E8E8 37%, #F1F1F1 63%);
    background-size: 800px 100%;
    animation: kib-shimmer 1.4s ease-in-out infinite;
  }
`;

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <>
      <style>{shimmer}</style>
      <div className={`kib-skeleton rounded-md ${className}`} />
    </>
  );
}

export function TableRowSkeleton({ cols, hasAvatar = true }: { cols: number; hasAvatar?: boolean }) {
  return (
    <tr className="border-b border-slate-50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          {i === 0 && hasAvatar ? (
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-7 h-7 rounded-md shrink-0" />
              <Skeleton className="h-2.5 w-24" />
            </div>
          ) : (
            <Skeleton className={`h-2.5 ${i === 0 ? 'w-24' : 'w-16'} max-w-full`} />
          )}
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ cols, rows = 6, hasAvatar = true }: { cols: number; rows?: number; hasAvatar?: boolean }) {
  return (
    <div className="bg-surface border border-border-soft rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <Skeleton className="h-2 w-14" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} cols={cols} hasAvatar={hasAvatar} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MetricSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-2.5 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface border border-border-soft rounded-2xl flex items-center gap-3 px-3 py-3 overflow-hidden">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-3 w-3/4 max-w-[7rem]" />
            <Skeleton className="h-5 w-1/2 max-w-[4.5rem]" />
          </div>
        </div>
      ))}
    </div>
  );
}
