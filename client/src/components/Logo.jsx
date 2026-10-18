import { Leaf } from 'lucide-react';

export default function Logo({ light = false }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white shadow-lg shadow-brand/30">
        <Leaf className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="leading-tight">
        <p className={`text-lg font-bold ${light ? 'text-white' : 'text-ink'}`}>SpendWise</p>
        <p className={`text-[11px] ${light ? 'text-slate-400' : 'text-muted'}`}>Track • Save • Grow</p>
      </div>
    </div>
  );
}
