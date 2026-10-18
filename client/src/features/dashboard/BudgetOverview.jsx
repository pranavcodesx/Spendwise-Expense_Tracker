import { Target } from 'lucide-react';
import { CardHeader } from '../../components/ui/Card';
import { CategoryIcon } from '../../components/ui/Badge';
import { formatMoney } from '../../utils/format';
import { getCategory } from '../../utils/categories';

export default function BudgetOverview({ budgets }) {
  const top = [...budgets].sort((a, b) => b.percentUsed - a.percentUsed).slice(0, 4);
  return (
    <section className="card p-5">
      <CardHeader icon={Target} title="Budget Overview" to="/budgets" />
      {top.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No budgets set for this month. Use “Set Budget” below to add a spending limit.</p>
      ) : (
        <ul className="mt-5 space-y-5">
          {top.map((b) => {
            const color = b.percentUsed >= 100 ? '#EF4444' : getCategory(b.category).color;
            return (
              <li key={b.id} className="flex items-start gap-3">
                <CategoryIcon category={b.category} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-semibold">{b.category}</span>
                    <span className="text-xs text-muted">{formatMoney(b.spent)} / {formatMoney(b.limitAmount)}</span>
                    <span className="font-semibold">{Math.round(b.percentUsed)}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100" role="progressbar" aria-label={`${b.category} budget used`} aria-valuenow={Math.round(b.percentUsed)} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-2 rounded-full" style={{ width: `${Math.min(b.percentUsed, 100)}%`, backgroundColor: color }} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
