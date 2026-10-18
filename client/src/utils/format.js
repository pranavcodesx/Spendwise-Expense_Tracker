let currency = 'INR'; // set from the logged-in user's profile by AuthContext
export const setCurrency = (c) => { currency = c || 'INR'; };

export const formatMoney = (n) =>
  new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n || 0);
export const formatINR = formatMoney;

// API dates are "YYYY-MM-DD" (UTC). Formatting in UTC keeps the day from shifting.
export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
export const formatWeekday = (iso) => new Date(iso).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });

// Local calendar date as "YYYY-MM-DD" (what <input type="date"> uses)
export const toYMD = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const monthNow = () => toYMD(new Date()).slice(0, 7);
export const monthLabel = (ym) => new Date(`${ym}-01T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
