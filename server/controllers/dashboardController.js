import Transaction from '../models/Transaction.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getRange, lastMonths, previousRange, ymOf } from '../utils/dates.js';
import { pctChange, round1 } from '../utils/math.js';
import { buildSummary, categoryBreakdown, monthlySeries, periodTotals } from '../services/stats.js';

export const summary = asyncHandler(async (req, res) => {
  const range = getRange(req.query);
  const prev = previousRange(range);
  const [cur, old] = await Promise.all([periodTotals(req.user._id, range.from, range.toExclusive), periodTotals(req.user._id, prev.from, prev.toExclusive)]);
  const now = buildSummary(cur.income, cur.expenses);
  const before = buildSummary(old.income, old.expenses);
  const changes = {
    income: pctChange(now.income, before.income),
    expenses: pctChange(now.expenses, before.expenses),
    balance: pctChange(now.balance, before.balance),
    savingsRate: old.income > 0 ? round1(now.savingsRate - before.savingsRate) : null,
  };
  res.json({ success: true, data: { ...now, changes } });
});

// Bars = last 6 calendar months ending in the selected period. Donut = expenses inside the selected period.
export const charts = asyncHandler(async (req, res) => {
  const range = getRange(req.query);
  const months = lastMonths(ymOf(range.to), 6);
  const [incomeVsExpenses, categories] = await Promise.all([
    monthlySeries(req.user._id, months),
    categoryBreakdown(req.user._id, range.from, range.toExclusive),
  ]);
  res.json({ success: true, data: { incomeVsExpenses, categories } });
});

export const recent = asyncHandler(async (req, res) => {
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 5));
  const filter = { userId: req.user._id };
  if (req.query.from || req.query.to) {
    const { from, toExclusive } = getRange(req.query);
    filter.date = { $gte: from, $lt: toExclusive };
  }
  const items = await Transaction.find(filter).sort({ date: -1, createdAt: -1 }).limit(limit);
  res.json({ success: true, data: { items } });
});
