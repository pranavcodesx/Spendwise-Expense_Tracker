import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { PRESETS, useDateRange } from '../context/DateRangeContext';
import { formatDate } from '../utils/format';
import Button from './ui/Button';

export default function DateRangePicker() {
  const { range, preset, setPreset, setCustom } = useDateRange();
  const [open, setOpen] = useState(false);
  const [custom, setCustomState] = useState(range);
  const invalid = !custom.from || !custom.to || custom.from > custom.to;
  const field = 'min-h-[44px] w-full rounded-xl border border-line px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';

  return (
    <div className="relative">
      <button onClick={() => { setCustomState(range); setOpen((o) => !o); }} aria-expanded={open} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-sm hover:bg-canvas">
        <Calendar className="h-4 w-4 text-muted" aria-hidden="true" />
        {formatDate(range.from)} – {formatDate(range.to)}
        <ChevronDown className="h-4 w-4 text-muted" aria-hidden="true" />
      </button>
      {open && (
        <>
          <button aria-label="Close date picker" className="fixed inset-0 z-30 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-line bg-white p-4 shadow-lg">
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button key={p.id} onClick={() => { setPreset(p.id); setOpen(false); }} className={`min-h-[40px] rounded-lg border px-2 text-sm font-medium ${preset === p.id ? 'border-brand bg-emerald-50 text-brand-dark' : 'border-line hover:bg-canvas'}`}>{p.label}</button>
              ))}
            </div>
            <p className="mb-2 mt-4 text-xs font-semibold text-muted">Custom range</p>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" aria-label="From date" value={custom.from} onChange={(e) => setCustomState((c) => ({ ...c, from: e.target.value }))} className={field} />
              <input type="date" aria-label="To date" value={custom.to} onChange={(e) => setCustomState((c) => ({ ...c, to: e.target.value }))} className={field} />
            </div>
            {invalid && custom.from && custom.to && <p className="mt-2 text-xs text-expense">The start date must be before the end date.</p>}
            <Button className="mt-3 w-full" disabled={invalid} onClick={() => { setCustom(custom.from, custom.to); setOpen(false); }}>Apply range</Button>
          </div>
        </>
      )}
    </div>
  );
}
