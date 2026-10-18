import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const base = 'w-full rounded-xl border bg-white text-sm text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';

export default function Input({ label, error, type = 'text', icon: Icon, as: Tag = 'input', className = '', ...props }) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const pad = Tag === 'textarea' ? 'px-3.5 py-2.5' : `min-h-[44px] ${Icon ? 'pl-10' : 'pl-3.5'} ${isPassword ? 'pr-11' : 'pr-3.5'}`;

  return (
    <div className={className}>
      {label && <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />}
        <Tag
          id={id}
          type={Tag === 'input' ? (isPassword && show ? 'text' : type) : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${base} ${pad} ${error ? 'border-expense' : 'border-line'}`}
          {...props}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-ink">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-expense">{error}</p>}
    </div>
  );
}
