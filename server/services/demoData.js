import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import AppError from '../utils/AppError.js';
import { currentMonth, lastMonths } from '../utils/dates.js';

const income = [
  { title: 'Monthly salary', category: 'Salary', amount: 55000, day: 1, pm: 'Bank Transfer' },
  { title: 'Freelance project', category: 'Freelance', amount: 12000, day: 15, pm: 'UPI', everyOther: true },
];
const expenses = [
  { title: 'Swiggy order', category: 'Food', amount: 450, day: 3, pm: 'UPI' },
  { title: 'Groceries', category: 'Food', amount: 2800, day: 8, pm: 'UPI' },
  { title: 'Dinner out', category: 'Food', amount: 1500, day: 20, pm: 'Card' },
  { title: 'Petrol', category: 'Travel', amount: 2000, day: 5, pm: 'Card' },
  { title: 'Cab rides', category: 'Travel', amount: 900, day: 18, pm: 'UPI' },
  { title: 'Clothes', category: 'Shopping', amount: 3500, day: 10, pm: 'Card' },
  { title: 'Electricity bill', category: 'Bills', amount: 1250, day: 6, pm: 'Net Banking' },
  { title: 'Internet bill', category: 'Bills', amount: 799, day: 7, pm: 'UPI' },
  { title: 'Movie night', category: 'Entertainment', amount: 800, day: 22, pm: 'UPI' },
  { title: 'Pharmacy', category: 'Health', amount: 640, day: 14, pm: 'Cash' },
  { title: 'Gift', category: 'Others', amount: 1000, day: 25, pm: 'Cash' },
];
const budgets = { Food: 8000, Travel: 5000, Shopping: 6000, Bills: 6000, Entertainment: 2000, Others: 3000 };

export async function createDemoData(userId) {
  if (await Transaction.exists({ userId, isDemo: true })) throw new AppError('Demo data is already loaded. Remove it first.', 409);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const rows = [];
  lastMonths(currentMonth(), 4).forEach((ym, i) => {
    const [y, m] = ym.split('-').map(Number);
    const add = (list, type) =>
      list.forEach((t, k) => {
        if (t.everyOther && i % 2) return;
        const date = new Date(Date.UTC(y, m - 1, t.day));
        if (date > today) return; // never create future-dated demo rows
        const amount = type === 'income' ? t.amount : Math.round((t.amount * (1 + (((i * 7 + k * 3) % 5) - 2) / 20)) / 10) * 10;
        rows.push({ userId, title: t.title, type, amount, category: t.category, date, paymentMethod: t.pm, notes: '', isDemo: true });
      });
    add(income, 'income');
    add(expenses, 'expense');
  });
  await Transaction.insertMany(rows);
  // Budgets: skip any category where the user already has a real budget this month.
  for (const [category, limitAmount] of Object.entries(budgets)) {
    await Budget.updateOne({ userId, month: currentMonth(), category }, { $setOnInsert: { limitAmount, isDemo: true } }, { upsert: true });
  }
  return { transactions: rows.length };
}

export async function clearDemoData(userId) {
  const [t, b] = await Promise.all([Transaction.deleteMany({ userId, isDemo: true }), Budget.deleteMany({ userId, isDemo: true })]);
  return { transactions: t.deletedCount, budgets: b.deletedCount };
}
