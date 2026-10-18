import Transaction from '../models/Transaction.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getRange } from '../utils/dates.js';
import { buildSummary, categoryBreakdown, periodTotals } from '../services/stats.js';
import { buildFilter } from './transactionController.js';

export const summary = asyncHandler(async (req, res) => {
  const { from, to, toExclusive } = getRange(req.query);
  const userId = req.user._id;
  const [t, expenseBreakdown, incomeBreakdown] = await Promise.all([
    periodTotals(userId, from, toExclusive),
    categoryBreakdown(userId, from, toExclusive, 'expense'),
    categoryBreakdown(userId, from, toExclusive, 'income'),
  ]);
  res.json({
    success: true,
    data: {
      period: { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) },
      ...buildSummary(t.income, t.expenses),
      counts: { total: t.incomeCount + t.expenseCount, income: t.incomeCount, expense: t.expenseCount },
      expenseBreakdown, incomeBreakdown,
    },
  });
});

// Spreadsheet programs run text starting with = + - @ as formulas, so we neutralise those cells.
const cell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export const exportCsv = asyncHandler(async (req, res) => {
  const { from, to } = getRange(req.query);
  const filter = buildFilter(req.user._id, { ...req.query, from: req.query.from || from.toISOString().slice(0, 10), to: req.query.to || to.toISOString().slice(0, 10) });
  const rows = await Transaction.find(filter).sort({ date: -1, _id: -1 }).limit(10000);
  const lines = [['Date', 'Title', 'Type', 'Category', 'Payment Method', 'Amount', 'Notes'].map(cell).join(',')];
  rows.forEach((r) => lines.push([r.date.toISOString().slice(0, 10), r.title, r.type, r.category, r.paymentMethod, r.amount.toFixed(2), r.notes].map(cell).join(',')));
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="spendwise-${from.toISOString().slice(0, 10)}-to-${to.toISOString().slice(0, 10)}.csv"`);
  res.send(`\uFEFF${lines.join('\r\n')}`);
});
