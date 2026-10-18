import { Clock } from 'lucide-react';
import { CardHeader } from '../../components/ui/Card';
import { Badge, CategoryIcon } from '../../components/ui/Badge';
import { formatDate, formatMoney } from '../../utils/format';
import { getCategory } from '../../utils/categories';

export default function RecentTransactions({ items }) {
  return (
    <section className="card p-5 xl:col-span-2">
      <CardHeader icon={Clock} title="Recent Transactions" to="/transactions" />
      {items.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No transactions in this period. Use “Add Transaction” below to record your first one.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead className="bg-canvas text-xs font-semibold text-muted">
              <tr>
                <th className="rounded-l-lg px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Description</th>
                <th className="hidden px-3 py-2.5 md:table-cell">Category</th>
                <th className="hidden px-3 py-2.5 md:table-cell">Type</th>
                <th className="rounded-r-lg px-3 py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((t) => {
                const expense = t.type === 'expense';
                return (
                  <tr key={t.id}>
                    <td className="whitespace-nowrap px-3 py-3 text-muted">{formatDate(t.date)}</td>
                    <td className="px-3 py-3"><span className="flex items-center gap-3 font-medium"><CategoryIcon category={t.category} />{t.title}</span></td>
                    <td className="hidden px-3 py-3 md:table-cell"><Badge color={getCategory(t.category).color}>{t.category}</Badge></td>
                    <td className="hidden px-3 py-3 md:table-cell"><Badge color={expense ? '#EF4444' : '#10B981'}>{expense ? 'Expense' : 'Income'}</Badge></td>
                    <td className={`whitespace-nowrap px-3 py-3 text-right font-semibold ${expense ? 'text-expense' : 'text-emerald-600'}`}>{expense ? '-' : '+'} {formatMoney(t.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
