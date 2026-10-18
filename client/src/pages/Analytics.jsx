import { BarChart3, Hash, Receipt, Tag, Target, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SummaryCard from '../components/ui/SummaryCard';
import Spinner, { ErrorState } from '../components/ui/Spinner';
import { CardHeader } from '../components/ui/Card';
import { CategoryIcon } from '../components/ui/Badge';
import { CategoryDonut, IncomeExpenseChart, SpendingTrendChart } from '../components/charts/Charts';
import useFetch from '../hooks/useFetch';
import { useDateRange } from '../context/DateRangeContext';
import { analyticsApi } from '../services/dataService';
import { getCategory } from '../utils/categories';
import { formatMoney } from '../utils/format';

function Tile({ icon: Icon, label, value, sub }) {
  return (
    <div className="card flex items-center gap-4 p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-canvas text-muted"><Icon className="h-5 w-5" aria-hidden="true" /></span>
      <div className="min-w-0"><p className="text-xs text-muted">{label}</p><p className="truncate font-bold">{value}</p>{sub && <p className="truncate text-xs text-muted">{sub}</p>}</div>
    </div>
  );
}

export default function Analytics() {
  const { range } = useDateRange();
  const p = { from: range.from, to: range.to };
  const deps = [range.from, range.to];
  const summary = useFetch(() => analyticsApi.summary(p), deps);
  const cats = useFetch(() => analyticsApi.categories(p), deps);
  const trends = useFetch(() => analyticsApi.trends(p), deps);
  const s = summary.data;

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Understand where your money comes from and where it goes." />

      {summary.error ? <ErrorState message={summary.error} onRetry={summary.reload} /> : !s ? <Spinner /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard tone="green" icon={TrendingUp} label="Income" value={formatMoney(s.income)} footnote="Selected period" />
            <SummaryCard tone="rose" icon={TrendingDown} label="Expenses" value={formatMoney(s.expenses)} footnote="Selected period" />
            <SummaryCard tone="sky" icon={Wallet} label="Net savings" value={formatMoney(s.balance)} footnote="Income minus expenses" />
            <SummaryCard tone="violet" icon={Target} label="Savings rate" value={`${s.savingsRate}%`} footnote="Share of income kept" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Tile icon={Hash} label="Transactions" value={s.transactionCount} />
            <Tile icon={Receipt} label="Average expense" value={formatMoney(s.averageExpense)} />
            <Tile icon={TrendingDown} label="Largest expense" value={s.largestExpense ? formatMoney(s.largestExpense.amount) : '—'} sub={s.largestExpense?.title} />
            <Tile icon={Tag} label="Top category" value={s.topCategory?.category || '—'} sub={s.topCategory ? formatMoney(s.topCategory.amount) : undefined} />
          </div>
        </>
      )}

      {trends.error ? <ErrorState message={trends.error} onRetry={trends.reload} /> : !trends.data ? <Spinner /> : (
        <div className="grid gap-6 xl:grid-cols-2">
          <IncomeExpenseChart data={trends.data.months} />
          <SpendingTrendChart data={trends.data.months} />
        </div>
      )}

      {cats.error ? <ErrorState message={cats.error} onRetry={cats.reload} /> : !cats.data ? <Spinner /> : (
        <div className="grid gap-6 xl:grid-cols-2">
          <CategoryDonut data={cats.data.categories} />
          <section className="card p-5">
            <CardHeader icon={BarChart3} title="Top Spending Categories" />
            {cats.data.categories.length === 0 ? <p className="py-16 text-center text-sm text-muted">No expenses in this period yet.</p> : (
              <ol className="mt-5 space-y-5">
                {cats.data.categories.slice(0, 5).map((c, i) => (
                  <li key={c.category} className="flex items-start gap-3">
                    <span className="mt-1 w-4 text-sm font-semibold text-muted">{i + 1}</span>
                    <CategoryIcon category={c.category} />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2 text-sm"><span className="font-semibold">{c.category} <span className="font-normal text-muted">· {c.count} {c.count === 1 ? 'transaction' : 'transactions'}</span></span><span className="font-semibold">{formatMoney(c.amount)}</span></div>
                      <div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full" style={{ width: `${c.percent}%`, backgroundColor: getCategory(c.category).color }} /></div>
                      <p className="mt-1 text-xs text-muted">{c.percent}% of total spending</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
