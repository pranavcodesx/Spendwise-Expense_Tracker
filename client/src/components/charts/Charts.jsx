import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import { CardHeader } from '../ui/Card';
import { formatMoney } from '../../utils/format';
import { getCategory } from '../../utils/categories';

const tick = { fill: '#64748B', fontSize: 12 };
const compact = (v) => (Math.abs(v) >= 1000 ? `${Math.round(v / 100) / 10}K` : v);

export function IncomeExpenseChart({ data }) {
  const empty = !data.some((d) => d.income || d.expenses);
  const legend = (
    <div className="flex items-center gap-4 text-xs text-muted">
      <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-brand" />Income</span>
      <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-info" />Expenses</span>
    </div>
  );
  return (
    <section className="card p-5">
      <CardHeader icon={BarChart3} title="Income vs Expenses" action={legend} />
      {empty ? (
        <p className="py-16 text-center text-sm text-muted">No income or expenses recorded for these months yet.</p>
      ) : (
        <div className="mt-4 h-64" role="img" aria-label="Bar chart comparing monthly income and expenses">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={tick} />
              <YAxis tickLine={false} axisLine={false} width={48} tick={tick} tickFormatter={compact} />
              <Tooltip formatter={(v) => formatMoney(v)} cursor={{ fill: '#F1F5F9' }} />
              <Bar dataKey="income" name="Income" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="expenses" name="Expenses" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export function CategoryDonut({ data, title = 'Spending by Category', centerLabel = 'Total spent', compactLayout = false }) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  return (
    <section className="card p-5">
      <CardHeader icon={PieIcon} title={title} />
      {total === 0 ? (
        <p className="py-16 text-center text-sm text-muted">No expenses in this period yet. Add a transaction to see your breakdown.</p>
      ) : (
        <div className={`mt-4 flex flex-col items-center gap-6 ${compactLayout ? '' : 'sm:flex-row'}`}>
          <div className="relative h-52 w-52 shrink-0" role="img" aria-label={`Donut chart: ${title}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="amount" nameKey="category" innerRadius="62%" outerRadius="100%" paddingAngle={2} stroke="none">
                  {data.map((d) => <Cell key={d.category} fill={getCategory(d.category).color} />)}
                </Pie>
                <Tooltip formatter={(v) => formatMoney(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div><p className="text-lg font-bold">{formatMoney(total)}</p><p className="text-xs text-muted">{centerLabel}</p></div>
            </div>
          </div>
          <ul className="w-full space-y-2.5 text-sm">
            {data.map((d) => (
              <li key={d.category} className="grid grid-cols-[1fr_auto_auto] items-center gap-3">
                <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getCategory(d.category).color }} />{d.category}</span>
                <span className="text-muted">{((d.amount / total) * 100).toFixed(1)}%</span>
                <span className="min-w-[4.5rem] text-right font-medium">{formatMoney(d.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

// Needs at least two months with activity, otherwise a "trend" would be misleading.
export function SpendingTrendChart({ data }) {
  const active = data.filter((d) => d.income || d.expenses).length;
  return (
    <section className="card p-5">
      <CardHeader icon={TrendingUp} title="Monthly Spending Trend" />
      {active < 2 ? (
        <p className="py-16 text-center text-sm text-muted">A trend needs transactions in at least two different months. Add more data or widen the date range.</p>
      ) : (
        <div className="mt-4 h-64" role="img" aria-label="Area chart of monthly expenses">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs><linearGradient id="spend" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} /><stop offset="100%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={tick} />
              <YAxis tickLine={false} axisLine={false} width={48} tick={tick} tickFormatter={compact} />
              <Tooltip formatter={(v) => formatMoney(v)} />
              <Legend />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#3B82F6" strokeWidth={2.5} fill="url(#spend)" />
              <Area type="monotone" dataKey="net" name="Net savings" stroke="#10B981" strokeWidth={2.5} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
