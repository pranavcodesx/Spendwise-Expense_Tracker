import AppError from './AppError.js';

// Every date in the API is a plain "YYYY-MM-DD" string treated as UTC midnight.
// This is what prevents "off by one day" timezone bugs.
const YMD = /^\d{4}-\d{2}-\d{2}$/;
export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function parseYMD(str) {
  if (typeof str !== 'string' || !YMD.test(str)) return null;
  const d = new Date(`${str}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== str ? null : d;
}
export const isMonth = (s) => typeof s === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(s);
export const addDays = (d, n) => new Date(d.getTime() + n * 86400000);
export const monthStart = (ym) => new Date(`${ym}-01T00:00:00.000Z`);
export const nextMonthStart = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
export const ymOf = (d) => d.toISOString().slice(0, 7);
export const currentMonth = () => new Date().toISOString().slice(0, 7);

// Reads ?from=YYYY-MM-DD&to=YYYY-MM-DD. Missing values default to a calendar month.
export function getRange(query = {}) {
  let from = query.from ? parseYMD(query.from) : null;
  let to = query.to ? parseYMD(query.to) : null;
  if ((query.from && !from) || (query.to && !to)) throw new AppError('Dates must use the YYYY-MM-DD format', 400);
  const base = from || to || new Date();
  if (!from) from = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1));
  if (!to) to = addDays(nextMonthStart(from), -1);
  if (from > to) throw new AppError('The start date must be before the end date', 400);
  return { from, to, toExclusive: addDays(to, 1) };
}

// The period right before the selected one (used for "vs last month" changes).
export function previousRange({ from, toExclusive }) {
  const isWholeMonth = from.getUTCDate() === 1 && toExclusive.getTime() === nextMonthStart(from).getTime();
  if (isWholeMonth) return { from: new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() - 1, 1)), toExclusive: from };
  return { from: new Date(from.getTime() - (toExclusive - from)), toExclusive: from };
}

export function lastMonths(endYm, n) {
  const [y, m] = endYm.split('-').map(Number);
  return Array.from({ length: n }, (_, i) => new Date(Date.UTC(y, m - 1 - (n - 1 - i), 1)).toISOString().slice(0, 7));
}
export function monthsInRange(from, to, cap = 12) {
  const count = (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth()) + 1;
  return lastMonths(ymOf(to), Math.min(count, cap));
}
