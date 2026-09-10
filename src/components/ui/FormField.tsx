interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  span?: boolean;
}

/** Label + input wrapper used across CRUD forms. */
export function FormField({ label, required, children, span }: FormFieldProps) {
  return (
    <div className={`space-y-1 ${span ? 'md:col-span-2' : ''}`}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      {children}
    </div>
  );
}

/** Standard text input styling shared by all forms. */
export const inputClass =
  'h-9 w-full rounded-lg border border-border-soft px-3 text-xs focus:outline-none focus:border-accent bg-surface';
