export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
      <div className="w-12 h-12 mb-3 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-slate-300">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V8a3 3 0 00-3-3H7a3 3 0 00-3 3v5m16 0a3 3 0 01-3 3H7a3 3 0 01-3-3m16 0h1a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3a1 1 0 011-1h1" />
        </svg>
      </div>
      <p className="text-xs font-semibold text-slate-500">{title}</p>
      {hint && <p className="text-[11px] text-slate-400 mt-1 max-w-xs">{hint}</p>}
    </div>
  );
}
