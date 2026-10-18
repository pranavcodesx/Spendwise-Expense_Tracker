import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, total, limit, onPage }) {
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);
  const btn = 'grid h-10 min-w-[40px] place-items-center rounded-lg border border-line px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50';
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-4 sm:flex-row">
      <p className="text-sm text-muted">Showing {first} - {last} of {total} transactions</p>
      <nav aria-label="Pagination" className="flex items-center gap-1.5">
        <button className={`${btn} gap-1`} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
        {pages.map((p) => (
          <button key={p} onClick={() => onPage(p)} aria-current={p === page ? 'page' : undefined} className={`${btn} ${p === page ? 'border-brand bg-brand text-white' : 'bg-white hover:bg-canvas'}`}>{p}</button>
        ))}
        <button className={btn} disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
      </nav>
    </div>
  );
}
