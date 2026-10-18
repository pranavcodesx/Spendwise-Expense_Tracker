import { ArrowDown, ArrowUp } from 'lucide-react';

const tones = {
  green: 'border-emerald-100 bg-emerald-50 [&_.ico]:bg-emerald-100 [&_.ico]:text-emerald-600',
  rose: 'border-rose-100 bg-rose-50 [&_.ico]:bg-rose-100 [&_.ico]:text-rose-500',
  sky: 'border-sky-100 bg-sky-50 [&_.ico]:bg-sky-100 [&_.ico]:text-sky-600',
  violet: 'border-violet-100 bg-violet-50 [&_.ico]:bg-violet-100 [&_.ico]:text-violet-600',
};

// delta: number = % change vs previous period, null = nothing to compare, undefined = show footnote instead.
// goodWhenUp=false means a rising number is bad news (e.g. expenses) and is shown in red.
export default function SummaryCard({ tone, icon: Icon, label, value, delta, goodWhenUp = true, footnote }) {
  const good = delta >= 0 === goodWhenUp;
  const Arrow = delta >= 0 ? ArrowUp : ArrowDown;
  return (
    <div className={`rounded-card border p-5 shadow-card ${tones[tone]}`}>
      <div className="flex items-center gap-4">
        <span className="ico grid h-12 w-12 shrink-0 place-items-center rounded-full"><Icon className="h-6 w-6" aria-hidden="true" /></span>
        <div className="min-w-0">
          <p className="text-sm text-ink/80">{label}</p>
          <p className="truncate text-2xl font-bold">{value}</p>
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-muted">
        {typeof delta === 'number' ? (
          <>
            <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold ${good ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
              <Arrow className="h-3 w-3" aria-hidden="true" />{Math.abs(delta)}%
            </span>
            vs previous period
          </>
        ) : delta === null ? 'No data in the previous period' : footnote}
      </p>
    </div>
  );
}
