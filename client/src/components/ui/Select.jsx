import { useId } from 'react';
import { ChevronDown } from 'lucide-react';

// options: array of strings, or { value, label }
export default function Select({ label, error, options, className = '', ...props }) {
  const id = useId();
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">{label}</label>}
      <div className="relative">
        <select id={id} aria-invalid={Boolean(error)} className={`min-h-[44px] w-full appearance-none rounded-xl border bg-white pl-3.5 pr-9 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 ${error ? 'border-expense' : 'border-line'}`} {...props}>
          {options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      </div>
      {error && <p role="alert" className="mt-1 text-xs text-expense">{error}</p>}
    </div>
  );
}
