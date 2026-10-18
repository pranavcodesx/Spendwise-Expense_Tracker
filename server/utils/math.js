export const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
export const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10;
// % change; null when there is nothing to compare against
export const pctChange = (cur, prev) => (prev > 0 ? round1(((cur - prev) / prev) * 100) : null);
