/**
 * KIB SFA global color system — mirrors the KIB-ERP design language.
 * Accent = KIB brand red (preserved). Neutrals/status mirror the Tailwind v4
 * `@theme` tokens in index.css so there is no drift between JS and CSS.
 */
export const colors = {
  accent: {
    primary: '#EA4335',
    primaryHover: '#d3362a',
    primarySoft: '#b82318',
    primaryBg: 'rgba(234, 67, 53, 0.1)',
    primaryBorder: 'rgba(234, 67, 53, 0.25)',
    gradientStart: '#f05a4f',
    gradientEnd: '#EA4335',
    tint: '#FDEDEB',
    hoverTint: '#FDF0EE',
    focus: 'rgba(234, 67, 53, 0.35)',
  },
  neutral: {
    background: '#FAFAFA',
    card: '#FFFFFF',
    sidebar: '#FBFBFB',
    border: '#D9D9D9',
    borderLight: '#E9E9E9',
    text: '#171717',
    textMuted: '#737373',
    textSubtle: '#D4D4D4',
  },
  status: {
    success: '#10B981',
    pending: '#F59E0B',
    danger: '#F43F5E',
    info: '#0EA5E9',
  },
} as const;

/** Platform-feel radii (mirror @theme in index.css). */
export const radii = {
  control: 8,
  card: 12,
  panel: 16,
} as const;

/** Status → semantic badge class strings (Tailwind utilities). */
export const statusBadge: Record<string, string> = {
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  INACTIVE: 'bg-slate-100 text-slate-500 border-slate-200',
};
