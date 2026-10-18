import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getRange } from '../utils/dates.js';
import { qs, validateTransaction } from '../utils/validators.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Builds the MongoDB filter. userId always comes from the logged-in user.
export function buildFilter(userId, q) {
  const filter = { userId };
  if (qs(q.type)) {
    if (!['income', 'expense'].includes(qs(q.type))) throw new AppError('Type must be income or expense', 400);
    filter.type = qs(q.type);
  }
  if (qs(q.category)) filter.category = qs(q.category);
  if (qs(q.paymentMethod)) filter.paymentMethod = qs(q.paymentMethod);
  if (q.from || q.to) {
    const { from, toExclusive } = getRange(q);
    filter.date = { $gte: from, $lt: toExclusive };
  }
  if (qs(q.search)) {
    const rx = { $regex: escapeRegex(qs(q.search).slice(0, 60)), $options: 'i' };
    filter.$or = [{ title: rx }, { category: rx }, { notes: rx }];
  }
  return filter;
}

async function findOwned(id, userId) {
  const found = mongoose.isValidObjectId(id) ? await Transaction.findOne({ _id: id, userId }) : null;
  if (!found) throw new AppError('Transaction not found', 404);
  return found;
}

const SORTS = { date: 'date', amount: 'amount', title: 'title' };

export const list = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const field = SORTS[qs(req.query.sortBy)] || 'date';
  const dir = qs(req.query.order) === 'asc' ? 1 : -1;
  const filter = buildFilter(req.user._id, req.query);
  const [items, total] = await Promise.all([
    Transaction.find(filter).sort({ [field]: dir, _id: -1 }).skip((page - 1) * limit).limit(limit),
    Transaction.countDocuments(filter),
  ]);
  res.json({ success: true, data: { items, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } } });
});

export const getOne = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { transaction: await findOwned(req.params.id, req.user._id) } });
});

export const create = asyncHandler(async (req, res) => {
  const data = validateTransaction(req.body);
  const transaction = await Transaction.create({ ...data, userId: req.user._id });
  res.status(201).json({ success: true, data: { transaction } });
});

export const update = asyncHandler(async (req, res) => {
  const existing = await findOwned(req.params.id, req.user._id);
  const current = {
    title: existing.title, type: existing.type, amount: existing.amount, category: existing.category,
    date: existing.date.toISOString().slice(0, 10), paymentMethod: existing.paymentMethod, notes: existing.notes,
  };
  // Validate the merged result so type + category always stay consistent.
  existing.set(validateTransaction({ ...current, ...req.body }));
  await existing.save();
  res.json({ success: true, data: { transaction: existing } });
});

export const remove = asyncHandler(async (req, res) => {
  const t = await findOwned(req.params.id, req.user._id);
  await t.deleteOne();
  res.json({ success: true, message: 'Transaction deleted' });
});
