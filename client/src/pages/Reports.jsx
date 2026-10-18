import { useState } from 'react';
import { Download, FileText, Target, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SummaryCard from '../components/ui/SummaryCard';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Spinner, { ErrorState } from '../components/ui/Spinner';
import { CardHeader } from '../components/ui/Card';
import { CategoryIcon } from '../components/ui/Badge';
import useFetch from '../hooks/useFetch';
import { useToast } from '../context/ToastContext';
import { useDateRange } from '../context/DateRangeContext';
import { reportApi } from '../services/dataService';
import { getCategory } from '../utils/categories';
import { getErrorMessage } from '../utils/errors';
import { formatMoney } from '../utils/format';

function Breakdown({ title, rows, empty }) {
  return (
    <section className="card p-5">
      <CardHeader icon={FileText} title={title} />
      {rows.length === 0 ? <p className="py-10 text-center text-sm text-muted">{empty}</p> : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted"><tr><th className="py-2 font-semibold">Category</th><th className="py-2 text-right font-semibold">Count</th><th className="py-2 text-right font-semibold">Amount</th><th className="py-2 text-right font-semibold">Share</th></tr></thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.category}>
                  <td className="py-3"><span className="flex items-center gap-3 font-medium"><CategoryIcon category={r.category} />{r.category}</span></td>
                  <td className="py-3 text-right text-muted">{r.count}</td>
                  <td className="py-3 text-right font-semibold">{formatMoney(r.amount)}</td>
                  <td className="py-3 pl-4 text-right">
                    <span className="inline-flex items-center gap-2"><span className="hidden h-2 w-16 rounded-full bg-slate-100 sm:block"><span className="block h-2 rounded-full" style={{ width: `${r.percent}%`, backgroundColor: getCategory(r.category).color }} /></span>{r.percent}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function Reports() {
  const toast = useToast();
  const { range } = useDateRange();
  const [type, setType] = useState('');
  const [exporting, setExporting] = useState(false);
  const { data: d, error, reload } = useFetch(() => reportApi.summary({ from: range.from, to: range.to }), [range.from, range.to]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const blob = await reportApi.exportCsv({ from: range.from, to: range.to, type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spendwise-${range.from}-to-${range.to}${type ? `-${type}` : ''}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV downloaded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Summaries for the selected period, plus CSV export." />

      {error ? <ErrorState message={error} onRetry={reload} /> : !d ? <Spinner /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard tone="green" icon={TrendingUp} label="Income summary" value={formatMoney(d.income)} footnote={`${d.counts.income} income ${d.counts.income === 1 ? 'entry' : 'entries'}`} />
            <SummaryCard tone="rose" icon={TrendingDown} label="Expense summary" value={formatMoney(d.expenses)} footnote={`${d.counts.expense} expense ${d.counts.expense === 1 ? 'entry' : 'entries'}`} />
            <SummaryCard tone="sky" icon={Wallet} label="Net balance" value={formatMoney(d.balance)} footnote="Income minus expenses" />
            <SummaryCard tone="violet" icon={Target} label="Savings rate" value={`${d.savingsRate}%`} footnote={`${d.counts.total} transactions in total`} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Breakdown title="Expense breakdown by category" rows={d.expenseBreakdown} empty="No expenses in this period." />
            <Breakdown title="Income breakdown by category" rows={d.incomeBreakdown} empty="No income in this period." />
          </div>

          <section className="card flex flex-wrap items-end justify-between gap-4 p-5">
            <div>
              <h2 className="flex items-center gap-2.5 text-base font-semibold"><Download className="h-5 w-5 text-brand" aria-hidden="true" /> Export transactions</h2>
              <p className="mt-1 text-sm text-muted">Downloads a CSV of every transaction from {range.from} to {range.to}{type ? ` (${type} only)` : ''}. Opens in Excel or Google Sheets.</p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <Select aria-label="Type to export" value={type} onChange={(e) => setType(e.target.value)} options={[{ value: '', label: 'Income + expenses' }, { value: 'income', label: 'Income only' }, { value: 'expense', label: 'Expenses only' }]} className="w-48" />
              <Button onClick={exportCsv} loading={exporting} disabled={d.counts.total === 0}><Download className="h-4 w-4" aria-hidden="true" /> Export CSV</Button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
