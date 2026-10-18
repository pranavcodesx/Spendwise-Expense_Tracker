import Transaction from '../models/Transaction.js';
import { monthStart, nextMonthStart, MONTH_LABELS } from '../utils/dates.js';
import { round1, round2 } from '../utils/math.js';

export const buildSummary = (income, expenses) => ({
  income: round2(income),
  expenses: round2(expenses),
  balance: round2(income - expenses), // opening balance is 0
  savingsRate: income > 0 ? round1(((income - expenses) / income) * 100) : 0, // safe when income is 0
});

export async function periodTotals(userId, from, toExclusive) {
  const rows = await Transaction.aggregate([
    { $match: { userId, date: { $gte: from, $lt: toExclusive } } },
    { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  const pick = (t) => rows.find((r) => r._id === t) || { total: 0, count: 0 };
  return { income: pick('income').total, expenses: pick('expense').total, incomeCount: pick('income').count, expenseCount: pick('expense').count };
}

export async function categoryBreakdown(userId, from, toExclusive, type = 'expense') {
  const rows = await Transaction.aggregate([
    { $match: { userId, type, date: { $gte: from, $lt: toExclusive } } },
    { $group: { _id: '$category', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { amount: -1 } },
  ]);
  const total = rows.reduce((s, r) => s + r.amount, 0);
  return rows.map((r) => ({ category: r._id, amount: round2(r.amount), count: r.count, percent: total ? round1((r.amount / total) * 100) : 0 }));
}

// months = ["2026-05", ..., "2026-10"]; months with no transactions are returned as zeros.
export async function monthlySeries(userId, months) {
  const start = monthStart(months[0]);
  const end = nextMonthStart(monthStart(months[months.length - 1]));
  const rows = await Transaction.aggregate([
    { $match: { userId, date: { $gte: start, $lt: end } } },
    { $group: { _id: { m: { $dateToString: { format: '%Y-%m', date: '$date', timezone: 'UTC' } }, t: '$type' }, total: { $sum: '$amount' } } },
  ]);
  const sum = (m, t) => rows.find((r) => r._id.m === m && r._id.t === t)?.total || 0;
  return months.map((m) => {
    const income = round2(sum(m, 'income'));
    const expenses = round2(sum(m, 'expense'));
    return { month: m, label: `${MONTH_LABELS[Number(m.slice(5)) - 1]} ${m.slice(2, 4)}`, income, expenses, net: round2(income - expenses) };
  });
}
