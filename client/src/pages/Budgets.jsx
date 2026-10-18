import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Lightbulb, Pencil, PiggyBank, Plus, Search, Target, Trash2, Wallet, CircleDollarSign } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SummaryCard from '../components/ui/SummaryCard';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import Spinner, { ErrorState } from '../components/ui/Spinner';
import { Badge, CategoryIcon } from '../components/ui/Badge';
import { CardHeader } from '../components/ui/Card';
import { CategoryDonut } from '../components/charts/Charts';
import BudgetModal from '../features/budgets/BudgetModal';
import useFetch from '../hooks/useFetch';
import { useToast } from '../context/ToastContext';
import { budgetApi } from '../services/dataService';
import { EXPENSE_CATEGORIES, getCategory } from '../utils/categories';
import { getErrorMessage } from '../utils/errors';
import { formatMoney, monthLabel, monthNow } from '../utils/format';

const STATUS = {
  good: { label: 'Good', color: '#2563EB' },
  'on-track': { label: 'On Track', color: '#059669' },
  high: { label: 'High', color: '#D97706' },
  exceeded: { label: 'Exceeded', color: '#DC2626' },
};
const spentColor = (pct) => (pct >= 100 ? 'text-expense' : pct >= 75 ? 'text-orange-500' : 'text-emerald-600');

export default function Budgets() {
  const toast = useToast();
  const [month, setMonth] = useState(monthNow());
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // { kind: 'add' | 'edit' | 'delete', item }
  const { data, loading, error, reload } = useFetch(() => budgetApi.list(month), [month]);

  const all = data?.items || [];
  const items = all.filter((b) => (!category || b.category === category) && b.category.toLowerCase().includes(search.toLowerCase()));
  const sm = data?.summary;

  const remove = async () => {
    try {
      await budgetApi.remove(modal.item.id);
      toast.success('Budget deleted');
      setModal(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // Insights are calculated from the real budget numbers
  const within = all.filter((b) => b.percentUsed < 75).length;
  const watch = all.filter((b) => b.percentUsed >= 75 && b.percentUsed < 100).length;
  const over = all.filter((b) => b.percentUsed >= 100).length;
  const insights = [];
  if (all.length && within) insights.push({ icon: CheckCircle2, tone: 'border-emerald-100 bg-emerald-50 text-emerald-700', title: "You're on track!", text: `${within} out of ${all.length} categories are under 75% of their limit.` });
  if (watch) insights.push({ icon: AlertTriangle, tone: 'border-amber-100 bg-amber-50 text-amber-700', title: 'Watch out!', text: `${watch} ${watch === 1 ? 'category is' : 'categories are'} using more than 75%.` });
  if (over) insights.push({ icon: AlertTriangle, tone: 'border-red-100 bg-red-50 text-red-700', title: 'Over budget', text: `${over} ${over === 1 ? 'category has' : 'categories have'} crossed the limit.` });
  if (sm && sm.remaining > 0 && sm.totalBudget > 0) insights.push({ icon: PiggyBank, tone: 'border-violet-100 bg-violet-50 text-violet-700', title: 'Still available', text: `${formatMoney(sm.remaining)} of your budget is unspent this month.` });

  return (
    <div className="space-y-6">
      <PageHeader title="Budgets" subtitle="Set spending limits and track your progress across categories." picker={false}>
        <input type="month" aria-label="Budget month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} className="min-h-[44px] rounded-xl border border-line bg-white px-3.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30" />
      </PageHeader>

      {sm && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard tone="green" icon={Wallet} label="Total Budget" value={formatMoney(sm.totalBudget)} footnote="Monthly limit" />
          <SummaryCard tone="rose" icon={CircleDollarSign} label="Total Spent" value={formatMoney(sm.totalSpent)} footnote={`${sm.percentUsed}% of budget`} />
          <SummaryCard tone="sky" icon={Wallet} label="Remaining" value={formatMoney(sm.remaining)} footnote={sm.remaining < 0 ? 'Over budget' : `${Math.max(0, Math.round((100 - sm.percentUsed) * 10) / 10)}% left`} />
          <SummaryCard tone="violet" icon={Target} label="Active Budgets" value={String(sm.activeBudgets)} footnote={`out of ${sm.totalCategories} categories`} />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card xl:col-span-2">
          <div className="space-y-4 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2.5 text-base font-semibold"><Target className="h-5 w-5 text-brand" aria-hidden="true" /> My Budgets <span className="text-sm font-normal text-muted">· {monthLabel(month)}</span></h2>
              <Button onClick={() => setModal({ kind: 'add' })}><Plus className="h-4 w-4" aria-hidden="true" /> Add Budget</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={[{ value: '', label: 'All Categories' }, ...EXPENSE_CATEGORIES]} className="w-full sm:w-44" />
              <div className="relative min-w-[180px] flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search categories" placeholder="Search categories..." className="min-h-[44px] w-full rounded-xl border border-line pl-10 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30" />
              </div>
            </div>
          </div>

          {error ? <ErrorState message={error} onRetry={reload} /> : !data ? <Spinner /> : items.length === 0 ? (
            <EmptyState icon={Target} title={all.length ? 'No budgets match your filters' : `No budgets for ${monthLabel(month)}`} text={all.length ? 'Clear the category or search filter.' : 'Add a spending limit for a category to start tracking it.'} action={!all.length && <Button onClick={() => setModal({ kind: 'add' })}><Plus className="h-4 w-4" aria-hidden="true" /> Add Budget</Button>} />
          ) : (
            <div className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
              <table className="w-full text-left text-sm">
                <thead className="border-y border-line bg-canvas text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Limit</th>
                    <th className="px-4 py-3 font-semibold">Spent</th>
                    <th className="hidden px-4 py-3 font-semibold md:table-cell">Remaining</th>
                    <th className="px-4 py-3 font-semibold">Usage</th>
                    <th className="hidden px-4 py-3 font-semibold sm:table-cell">Status</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {items.map((b) => (
                    <tr key={b.id}>
                      <td className="px-4 py-3"><span className="flex items-center gap-3 font-semibold"><CategoryIcon category={b.category} />{b.category}{b.isDemo && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">DEMO</span>}</span></td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold">{formatMoney(b.limitAmount)}</td>
                      <td className={`whitespace-nowrap px-4 py-3 font-semibold ${spentColor(b.percentUsed)}`}>{formatMoney(b.spent)}</td>
                      <td className={`hidden whitespace-nowrap px-4 py-3 font-semibold md:table-cell ${b.remaining < 0 ? 'text-expense' : 'text-emerald-600'}`}>{formatMoney(b.remaining)}</td>
                      <td className="min-w-[110px] px-4 py-3">
                        <p className="text-xs font-semibold">{b.percentUsed}%</p>
                        <div className="mt-1 h-2 rounded-full bg-slate-100" role="progressbar" aria-label={`${b.category} budget used`} aria-valuenow={Math.round(b.percentUsed)} aria-valuemin={0} aria-valuemax={100}>
                          <div className="h-2 rounded-full" style={{ width: `${Math.min(b.percentUsed, 100)}%`, backgroundColor: b.percentUsed >= 100 ? '#EF4444' : getCategory(b.category).color }} />
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell"><Badge color={STATUS[b.status].color}>{STATUS[b.status].label}</Badge></td>
                      <td className="px-4 py-3">
                        <span className="flex gap-1">
                          <button onClick={() => setModal({ kind: 'edit', item: b })} aria-label={`Edit ${b.category} budget`} className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setModal({ kind: 'delete', item: b })} aria-label={`Delete ${b.category} budget`} className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-expense hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {data && all.length > 0 && <p className="border-t border-line px-5 py-4 text-sm text-muted">Showing {items.length} of {all.length} budgets</p>}
        </section>

        <div className="space-y-6">
          <CategoryDonut compactLayout title="Monthly Overview" centerLabel="Spent" data={all.filter((b) => b.spent > 0).map((b) => ({ category: b.category, amount: b.spent }))} />
          <section className="card p-5">
            <CardHeader icon={Lightbulb} title="Budget Insights" />
            {insights.length === 0 ? <p className="py-6 text-sm text-muted">Insights appear once you have budgets for this month.</p> : (
              <ul className="mt-4 space-y-3">
                {insights.map(({ icon: Icon, tone, title, text }) => (
                  <li key={title} className={`flex items-start gap-3 rounded-xl border p-3.5 ${tone}`}>
                    <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                    <div><p className="text-sm font-semibold">{title}</p><p className="text-xs opacity-90">{text}</p></div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {(modal?.kind === 'add' || modal?.kind === 'edit') && <BudgetModal budget={modal.item} month={month} takenCategories={all.map((b) => b.category)} onClose={() => setModal(null)} onSaved={reload} />}
      {modal?.kind === 'delete' && <ConfirmDialog title="Delete budget?" message={`The ${modal.item.category} budget for ${monthLabel(month)} will be removed. Your transactions are not affected.`} onConfirm={remove} onClose={() => setModal(null)} />}
    </div>
  );
}
