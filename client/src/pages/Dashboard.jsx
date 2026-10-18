import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ChevronRight, Plus, Settings, Target, TrendingDown, TrendingUp, Wallet, Zap } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SummaryCard from '../components/ui/SummaryCard';
import Spinner, { ErrorState } from '../components/ui/Spinner';
import { CardHeader } from '../components/ui/Card';
import { CategoryDonut, IncomeExpenseChart } from '../components/charts/Charts';
import RecentTransactions from '../features/dashboard/RecentTransactions';
import BudgetOverview from '../features/dashboard/BudgetOverview';
import TransactionModal from '../features/transactions/TransactionModal';
import useAuth from '../hooks/useAuth';
import useFetch from '../hooks/useFetch';
import { useDateRange } from '../context/DateRangeContext';
import { budgetApi, dashboardApi } from '../services/dataService';
import { formatMoney } from '../utils/format';

const quickActions = [
  { to: '/budgets', title: 'Set Budget', desc: 'Manage your spending limits', icon: Target, card: 'border-sky-100 bg-sky-50', chip: 'bg-info' },
  { to: '/reports', title: 'View Reports', desc: 'Track your financial growth', icon: BarChart3, card: 'border-violet-100 bg-violet-50', chip: 'bg-budget-purple' },
  { to: '/settings', title: 'Settings', desc: 'Manage your account', icon: Settings, card: 'border-amber-100 bg-amber-50', chip: 'bg-budget-orange' },
];
const tile = 'flex min-h-[72px] items-center gap-4 rounded-2xl border p-4 text-left transition hover:shadow-card';

export default function Dashboard() {
  const { user } = useAuth();
  const { range } = useDateRange();
  const [adding, setAdding] = useState(false);
  const params = { from: range.from, to: range.to };

  const summary = useFetch(() => dashboardApi.summary(params), [range.from, range.to]);
  const charts = useFetch(() => dashboardApi.charts(params), [range.from, range.to]);
  const recent = useFetch(() => dashboardApi.recent({ ...params, limit: 5 }), [range.from, range.to]);
  const budgets = useFetch(() => budgetApi.list(range.to.slice(0, 7)), [range.to]);
  const refresh = () => [summary, charts, recent, budgets].forEach((q) => q.reload());

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const s = summary.data;

  return (
    <div className="space-y-6">
      <PageHeader title={`${greeting}, ${user.name.split(' ')[0]}!`} subtitle="Here’s your financial overview for the selected period." />

      {summary.error ? <ErrorState message={summary.error} onRetry={summary.reload} /> : !s ? <Spinner /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard tone="green" icon={TrendingUp} label="Total Income" value={formatMoney(s.income)} delta={s.changes.income} />
          <SummaryCard tone="rose" icon={TrendingDown} label="Total Expenses" value={formatMoney(s.expenses)} delta={s.changes.expenses} goodWhenUp={false} />
          <SummaryCard tone="sky" icon={Wallet} label="Current Balance" value={formatMoney(s.balance)} delta={s.changes.balance} />
          <SummaryCard tone="violet" icon={Target} label="Savings Rate" value={`${s.savingsRate}%`} delta={s.changes.savingsRate} />
        </div>
      )}

      {charts.error ? <ErrorState message={charts.error} onRetry={charts.reload} /> : !charts.data ? <Spinner /> : (
        <div className="grid gap-6 xl:grid-cols-2">
          <IncomeExpenseChart data={charts.data.incomeVsExpenses} />
          <CategoryDonut data={charts.data.categories} />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        {recent.data ? <RecentTransactions items={recent.data.items} /> : <div className="card xl:col-span-2">{recent.error ? <ErrorState message={recent.error} onRetry={recent.reload} /> : <Spinner />}</div>}
        {budgets.data ? <BudgetOverview budgets={budgets.data.items} /> : <div className="card">{budgets.error ? <ErrorState message={budgets.error} onRetry={budgets.reload} /> : <Spinner />}</div>}
      </div>

      <section className="card p-5">
        <CardHeader icon={Zap} title="Quick Actions" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <button onClick={() => setAdding(true)} className={`${tile} border-emerald-100 bg-emerald-50`}>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand text-white"><Plus className="h-6 w-6" aria-hidden="true" /></span>
            <span className="min-w-0 flex-1"><span className="block font-semibold">Add Transaction</span><span className="block text-xs text-muted">Record new income or expense</span></span>
            <ChevronRight className="h-4 w-4 text-muted" aria-hidden="true" />
          </button>
          {quickActions.map(({ to, title, desc, icon: Icon, card, chip }) => (
            <Link key={title} to={to} className={`${tile} ${card}`}>
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-white ${chip}`}><Icon className="h-6 w-6" aria-hidden="true" /></span>
              <span className="min-w-0 flex-1"><span className="block font-semibold">{title}</span><span className="block text-xs text-muted">{desc}</span></span>
              <ChevronRight className="h-4 w-4 text-muted" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      {adding && <TransactionModal onClose={() => setAdding(false)} onSaved={refresh} />}
    </div>
  );
}
