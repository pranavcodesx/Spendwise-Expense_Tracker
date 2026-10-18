import { Loader2 } from 'lucide-react';

export default function Spinner({ label = 'Loading…', className = 'py-16' }) {
  return (
    <div role="status" className={`flex items-center justify-center gap-2 text-sm text-muted ${className}`}>
      <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden="true" /> {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="py-12 text-center text-sm">
      <p className="text-expense">{message}</p>
      {onRetry && <button onClick={onRetry} className="mt-3 font-semibold text-brand-dark hover:underline">Try again</button>}
    </div>
  );
}
