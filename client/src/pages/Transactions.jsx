import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, ChevronRight, Pencil, Plus, Receipt, Search, Target, Trash2, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SummaryCard from '../components/ui/SummaryCard';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import Spinner, { ErrorState } from '../components/ui/Spinner';
import { Badge, CategoryIcon } from '../components/ui/Badge';
import TransactionModal from '../features/transactions/TransactionModal';
import useFetch from '../hooks/useFetch';
import { useToast } from '../context/ToastContext';
import { useDateRange } from '../context/DateRangeContext';
import { dashboardApi, transactionApi } from '../services/dataService';
import { ALL_CATEGORIES, PAYMENT_METHODS, getCategory, methodColors } from '../utils/categories';
import { getErrorMessage } from '../utils/errors';
import { formatDate, formatMoney, formatWeekday } from '../utils/format';

const LIMIT = 10;
const tabs = [{ id: '', label: 'All' }, { id: 'income', label: 'Income' }, { id: 'expense', label: 'Expenses' }];

function SortHead({ field, sort, onSort, children, className = '' }) {
  const active = sort.by === field;
  return (
    <th className={`px-4 py-3 ${className}`} aria-sort={active ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button onClick={() => onSort(field)} className="inline-flex items-center gap-1 font-semibold uppercase tracking-wide">
        {children}{active && (sort.order === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
      </button>
    </th>
  );
}

export default function Transactions() {
  const toast = useToast();
  const { range } = useDateRange();
  const [params] = useSearchParams();
  const urlSearch = params.get('search') || '';
  const [filters, setFilters] = useState({ type: '', category: '', paymentMethod: '', search: urlSearch });
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ by: 'date', order: 'desc' });
  const [modal, setModal] = useState(null); // { kind: 'add' | 'edit' | 'view' | 'delete', item }

  useEffect(() => { setSearchInput(urlSearch); }, [urlSearch]);
  useEffect(() => {
    const t = setTimeout(() => { setFilters((f) => ({ ...f, search: searchInput.trim() })); setPage(1); }, 350); // wait until typing stops
    return () => clearTimeout(t);
  }, [searchInput]);
  useEffect(() => { setPage(1); }, [range.from, range.to]);

  const query = { ...filters, from: range.from, to: range.to, page, limit: LIMIT, sortBy: sort.by, order: sort.order };
  const list = useFetch(() => transactionApi.list(query), [JSON.stringify(query)]);
  const summary = useFetch(() => dashboardApi.summary({ from: range.from, to: range.to }), [range.from, range.to]);
  const refresh = () => { list.reload(); summary.reload(); };

  const setFilter = (name, value) => { setFilters((f) => ({ ...f, [name]: value })); setPage(1); };
  const onSort = (field) => { setSort((s) => (s.by === field ? { by: field, order: s.order === 'asc' ? 'desc' : 'asc' } : { by: field, order: 'desc' })); setPage(1); };

  const remove = async () => {
    try {
      await transactionApi.remove(modal.item.id);
      toast.success('Transaction deleted');
      if (list.data.items.length === 1 && page > 1) setPage((p) => p - 1);
      setModal(null);
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const s = summary.data;
  const items = list.data?.items || [];
  const pg = list.data?.pagination;
  const iconBtn = 'grid h-9 w-9 place-items-center rounded-lg';

  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" subtitle="Track and manage all your income and expenses in one place." />

      {s && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard tone="green" icon={TrendingUp} label="Total Income" value={formatMoney(s.income)} delta={s.changes.income} />
          <SummaryCard tone="rose" icon={TrendingDown} label="Total Expenses" value={formatMoney(s.expenses)} delta={s.changes.expenses} goodWhenUp={false} />
          <SummaryCard tone="sky" icon={Wallet} label="Current Balance" value={formatMoney(s.balance)} delta={s.changes.balance} />
          <SummaryCard tone="violet" icon={Target} label="Savings Rate" value={`${s.savingsRate}%`} delta={s.changes.savingsRate} />
        </div>
      )}

      <section className="card">
        <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
          <div className="flex gap-1.5" role="group" aria-label="Filter by type">
            {tabs.map((t) => (
              <button key={t.label} aria-pressed={filters.type === t.id} onClick={() => setFilter('type', t.id)} className={`min-h-[40px] rounded-full border px-4 text-sm font-semibold ${filters.type === t.id ? 'border-brand bg-brand text-white' : 'border-line bg-white hover:bg-canvas'}`}>{t.label}</button>
            ))}
          </div>
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} aria-label="Search transactions" placeholder="Search transactions..." className="min-h-[44px] w-full rounded-xl border border-line bg-white pl-10 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30" />
          </div>
          <Select aria-label="Category" value={filters.category} onChange={(e) => setFilter('category', e.target.value)} options={[{ value: '', label: 'All Categories' }, ...ALL_CATEGORIES]} className="w-full sm:w-44" />
          <Select aria-label="Payment method" value={filters.paymentMethod} onChange={(e) => setFilter('paymentMethod', e.target.value)} options={[{ value: '', label: 'All Methods' }, ...PAYMENT_METHODS]} className="w-full sm:w-40" />
          <Button onClick={() => setModal({ kind: 'add' })}><Plus className="h-4 w-4" aria-hidden="true" /> Add Transaction</Button>
        </div>

        {list.error ? <ErrorState message={list.error} onRetry={list.reload} /> : !list.data ? <Spinner /> : items.length === 0 ? (
          <EmptyState icon={Receipt} title="No transactions found" text="Nothing matches these filters and dates. Try a wider date range, or add a new transaction." action={<Button onClick={() => setModal({ kind: 'add' })}><Plus className="h-4 w-4" aria-hidden="true" /> Add Transaction</Button>} />
        ) : (
          <div className={`overflow-x-auto ${list.loading ? 'opacity-60' : ''}`}>
            <table className="w-full text-left text-sm">
              <thead className="border-y border-line bg-canvas text-xs text-muted">
                <tr>
                  <th className="hidden px-4 py-3 font-semibold uppercase tracking-wide lg:table-cell">ID</th>
                  <SortHead field="date" sort={sort} onSort={onSort}>Date</SortHead>
                  <SortHead field="title" sort={sort} onSort={onSort}>Description</SortHead>
                  <th className="hidden px-4 py-3 font-semibold uppercase tracking-wide md:table-cell">Category</th>
                  <th className="hidden px-4 py-3 font-semibold uppercase tracking-wide md:table-cell">Type</th>
                  <th className="hidden px-4 py-3 font-semibold uppercase tracking-wide lg:table-cell">Payment</th>
                  <SortHead field="amount" sort={sort} onSort={onSort}>Amount</SortHead>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((t) => {
                  const expense = t.type === 'expense';
                  return (
                    <tr key={t.id} className="hover:bg-canvas/60">
                      <td className="hidden px-4 py-3 text-xs font-semibold text-muted lg:table-cell">{t.displayId}</td>
                      <td className="whitespace-nowrap px-4 py-3"><p className="font-medium">{formatDate(t.date)}</p><p className="text-xs text-muted">{formatWeekday(t.date)}</p></td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-3">
                          <CategoryIcon category={t.category} />
                          <span className="min-w-0">
                            <span className="block max-w-[14rem] truncate font-semibold">{t.title}{t.isDemo && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">DEMO</span>}</span>
                            <span className="block text-xs text-muted md:hidden">{t.category}</span>
                            {t.notes && <span className="hidden max-w-[14rem] truncate text-xs text-muted md:block">{t.notes}</span>}
                          </span>
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell"><Badge color={getCategory(t.category).color}>{t.category}</Badge></td>
                      <td className="hidden px-4 py-3 md:table-cell"><Badge color={expense ? '#EF4444' : '#10B981'}>{expense ? 'Expense' : 'Income'}</Badge></td>
                      <td className="hidden px-4 py-3 lg:table-cell">{t.paymentMethod ? <Badge color={methodColors[t.paymentMethod]}>{t.paymentMethod}</Badge> : <span className="text-muted">—</span>}</td>
                      <td className={`whitespace-nowrap px-4 py-3 font-semibold ${expense ? 'text-expense' : 'text-emerald-600'}`}>{expense ? '-' : '+'} {formatMoney(t.amount)}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1">
                          <button onClick={() => setModal({ kind: 'edit', item: t })} aria-label={`Edit ${t.title}`} className={`${iconBtn} bg-emerald-50 text-emerald-600 hover:bg-emerald-100`}><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setModal({ kind: 'delete', item: t })} aria-label={`Delete ${t.title}`} className={`${iconBtn} bg-red-50 text-expense hover:bg-red-100`}><Trash2 className="h-4 w-4" /></button>
                          <button onClick={() => setModal({ kind: 'view', item: t })} aria-label={`View details of ${t.title}`} className={`${iconBtn} text-muted hover:bg-canvas`}><ChevronRight className="h-4 w-4" /></button>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {pg && items.length > 0 && <Pagination page={pg.page} totalPages={pg.totalPages} total={pg.total} limit={pg.limit} onPage={setPage} />}
      </section>

      {(modal?.kind === 'add' || modal?.kind === 'edit') && <TransactionModal item={modal.item} onClose={() => setModal(null)} onSaved={refresh} />}
      {modal?.kind === 'delete' && <ConfirmDialog title="Delete transaction?" message={`“${modal.item.title}” (${formatMoney(modal.item.amount)}) will be permanently removed. This cannot be undone.`} onConfirm={remove} onClose={() => setModal(null)} />}
      {modal?.kind === 'view' && (
        <Modal title="Transaction details" onClose={() => setModal(null)}>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            {[
              ['ID', modal.item.displayId], ['Title', modal.item.title], ['Type', modal.item.type === 'income' ? 'Income' : 'Expense'],
              ['Amount', formatMoney(modal.item.amount)], ['Category', modal.item.category], ['Date', `${formatDate(modal.item.date)} (${formatWeekday(modal.item.date)})`],
              ['Payment method', modal.item.paymentMethod || '—'], ['Notes', modal.item.notes || '—'], ['Added on', formatDate(modal.item.createdAt)],
              ...(modal.item.isDemo ? [['Source', 'Demo data']] : []),
            ].map(([k, v]) => (<div key={k} className="contents"><dt className="text-muted">{k}</dt><dd className="break-words font-medium">{v}</dd></div>))}
          </dl>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModal({ kind: 'edit', item: modal.item })}><Pencil className="h-4 w-4" /> Edit</Button>
            <Button onClick={() => setModal(null)}>Close</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
