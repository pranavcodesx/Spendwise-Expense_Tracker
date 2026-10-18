import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { EXPENSE_CATEGORIES } from '../utils/constants.js';
import { currentMonth, isMonth, monthStart, nextMonthStart } from '../utils/dates.js';
import { round1, round2 } from '../utils/math.js';
import { qs, validateBudget } from '../utils/validators.js';

// Status labels used by the UI badges
const statusFor = (pct) => (pct >= 100 ? 'exceeded' : pct >= 75 ? 'high' : pct >= 50 ? 'on-track' : 'good');

export const list = asyncHandler(async (req, res) => {
  const month = qs(req.query.month) || currentMonth();
  if (!isMonth(month)) throw new AppError('Month must look like 2026-10', 400);
  const start = monthStart(month);
  const [budgets, spentRows] = await Promise.all([
    Budget.find({ userId: req.user._id, month }).sort({ category: 1 }),
    // Budgets are limits, not expenses: "spent" is always calculated from real expense transactions.
    Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'expense', date: { $gte: start, $lt: nextMonthStart(start) } } },
      { $group: { _id: '$category', spent: { $sum: '$amount' } } },
    ]),
  ]);
  const spentBy = Object.fromEntries(spentRows.map((r) => [r._id, r.spent]));
  const items = budgets.map((b) => {
    const spent = round2(spentBy[b.category] || 0);
    const percentUsed = round1((spent / b.limitAmount) * 100);
    return { ...b.toJSON(), spent, remaining: round2(b.limitAmount - spent), percentUsed, status: statusFor(percentUsed) };
  });
  const totalBudget = round2(items.reduce((s, b) => s + b.limitAmount, 0));
  const totalSpent = round2(items.reduce((s, b) => s + b.spent, 0));
  res.json({
    success: true,
    data: {
      month,
      items,
      summary: {
        totalBudget, totalSpent, remaining: round2(totalBudget - totalSpent),
        percentUsed: totalBudget ? round1((totalSpent / totalBudget) * 100) : 0,
        activeBudgets: items.length, totalCategories: EXPENSE_CATEGORIES.length,
      },
    },
  });
});

export const create = asyncHandler(async (req, res) => {
  const data = validateBudget(req.body);
  if (await Budget.exists({ userId: req.user._id, month: data.month, category: data.category })) {
    throw new AppError('You already have a budget for this category and month', 409, { category: 'A budget for this category already exists this month' });
  }
  const budget = await Budget.create({ ...data, userId: req.user._id });
  res.status(201).json({ success: true, data: { budget } });
});

async function findOwned(id, userId) {
  const found = mongoose.isValidObjectId(id) ? await Budget.findOne({ _id: id, userId }) : null;
  if (!found) throw new AppError('Budget not found', 404);
  return found;
}

// Only the limit can be edited. To change category or month, delete and create a new budget.
export const update = asyncHandler(async (req, res) => {
  const budget = await findOwned(req.params.id, req.user._id);
  budget.limitAmount = validateBudget(req.body, { categoryRequired: false }).limitAmount;
  await budget.save();
  res.json({ success: true, data: { budget } });
});

export const remove = asyncHandler(async (req, res) => {
  await (await findOwned(req.params.id, req.user._id)).deleteOne();
  res.json({ success: true, message: 'Budget deleted' });
});
