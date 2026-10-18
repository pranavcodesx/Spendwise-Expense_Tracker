import AppError from './AppError.js';
import { CURRENCIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from './constants.js';
import { isMonth, parseYMD } from './dates.js';

// Query/body values can be arrays or objects (NoSQL-injection attempts), so always check the type.
export const str = (v) => (typeof v === 'string' ? v.trim() : '');
export const isEmail = (v) => v.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

export function passwordIssue(pw) {
  if (typeof pw !== 'string' || pw.length < 8) return 'Password must be at least 8 characters';
  if (pw.length > 72) return 'Password must be 72 characters or fewer';
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw)) return 'Password needs upper and lower case letters';
  if (!/\d/.test(pw)) return 'Password needs at least one number';
  return '';
}

export function assertValid(errors) {
  const clean = Object.fromEntries(Object.entries(errors).filter(([, v]) => v));
  if (Object.keys(clean).length) throw new AppError('Please fix the highlighted fields', 400, clean);
}

export function validateRegister(b) {
  const e = {};
  const name = str(b.name);
  const email = str(b.email).toLowerCase();
  if (name.length < 2 || name.length > 60) e.name = 'Name must be 2 to 60 characters';
  if (!isEmail(email)) e.email = 'Enter a valid email address';
  e.password = passwordIssue(b.password);
  assertValid(e);
  return { name, email, password: b.password };
}

export function validateTransaction(b) {
  const e = {};
  const title = str(b.title);
  if (!title) e.title = 'Title is required';
  else if (title.length > 100) e.title = 'Title must be 100 characters or fewer';
  if (!['income', 'expense'].includes(b.type)) e.type = 'Type must be income or expense';
  const amount = Number(b.amount);
  if (b.amount === '' || b.amount == null || !Number.isFinite(amount) || amount <= 0) e.amount = 'Enter an amount greater than 0';
  else if (amount > 1e9) e.amount = 'Amount is too large';
  const cats = b.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  if (!cats.includes(b.category)) e.category = 'Choose a valid category';
  const date = parseYMD(b.date);
  if (!date) e.date = 'Choose a valid date';
  const paymentMethod = b.paymentMethod || '';
  if (paymentMethod && !PAYMENT_METHODS.includes(paymentMethod)) e.paymentMethod = 'Choose a valid payment method';
  const notes = typeof b.notes === 'string' ? b.notes.trim() : '';
  if (notes.length > 300) e.notes = 'Notes must be 300 characters or fewer';
  assertValid(e);
  return { title, type: b.type, amount: Math.round(amount * 100) / 100, category: b.category, date, paymentMethod, notes };
}

export function validateBudget(b, { categoryRequired = true } = {}) {
  const e = {};
  const limit = Number(b.limitAmount);
  if (categoryRequired && !EXPENSE_CATEGORIES.includes(b.category)) e.category = 'Choose a valid category';
  if (categoryRequired && !isMonth(b.month)) e.month = 'Choose a valid month';
  if (b.limitAmount === '' || b.limitAmount == null || !Number.isFinite(limit) || limit <= 0) e.limitAmount = 'Enter a limit greater than 0';
  else if (limit > 1e9) e.limitAmount = 'Limit is too large';
  assertValid(e);
  return { category: b.category, month: b.month, limitAmount: Math.round(limit * 100) / 100 };
}

export const isCurrency = (c) => CURRENCIES.includes(c);

// Query-string value as a trimmed string ('' if missing or not a string)
export const qs = (v) => (typeof v === 'string' ? v.trim() : '');
