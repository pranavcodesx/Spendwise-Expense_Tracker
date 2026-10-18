import Transaction from '../models/Transaction.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getRange, monthsInRange } from '../utils/dates.js';
import { round2 } from '../utils/math.js';
import { buildSummary, categoryBreakdown, monthlySeries, periodTotals } from '../services/stats.js';

export const summary = asyncHandler(async (req, res) => {
  const { from, toExclusive } = getRange(req.query);
  const userId = req.user._id;
  const [totals, topCategory, largest] = await Promise.all([
    periodTotals(userId, from, toExclusive),
    categoryBreakdown(userId, from, toExclusive).then((c) => c[0] || null),
    Transaction.findOne({ userId, type: 'expense', date: { $gte: from, $lt: toExclusive } }).sort({ amount: -1 }),
  ]);
  res.json({
    success: true,
    data: {
      ...buildSummary(totals.income, totals.expenses),
      transactionCount: totals.incomeCount + totals.expenseCount,
      averageExpense: totals.expenseCount ? round2(totals.expenses / totals.expenseCount) : 0,
      largestExpense: largest ? { title: largest.title, amount: largest.amount, category: largest.category } : null,
      topCategory,
    },
  });
});

export const spendingByCategory = asyncHandler(async (req, res) => {
  const { from, toExclusive } = getRange(req.query);
  res.json({ success: true, data: { categories: await categoryBreakdown(req.user._id, from, toExclusive) } });
});

export const monthlyTrends = asyncHandler(async (req, res) => {
  const { from, to } = getRange(req.query);
  res.json({ success: true, data: { months: await monthlySeries(req.user._id, monthsInRange(from, to, 12)) } });
});
