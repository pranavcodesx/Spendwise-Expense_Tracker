import { createContext, useContext, useMemo, useState } from 'react';
import { toYMD } from '../utils/format';

const DateRangeContext = createContext(null);
export const useDateRange = () => useContext(DateRangeContext);

export const PRESETS = [
  { id: 'this-month', label: 'This month' },
  { id: 'last-month', label: 'Last month' },
  { id: 'last-3', label: 'Last 3 months' },
  { id: 'this-year', label: 'This year' },
];

function presetRange(id) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const map = {
    'this-month': [new Date(y, m, 1), new Date(y, m + 1, 0)],
    'last-month': [new Date(y, m - 1, 1), new Date(y, m, 0)],
    'last-3': [new Date(y, m - 2, 1), new Date(y, m + 1, 0)],
    'this-year': [new Date(y, 0, 1), new Date(y, 11, 31)],
  };
  const [a, b] = map[id];
  return { from: toYMD(a), to: toYMD(b) };
}

// One shared date range for every page, so Dashboard, Transactions, Analytics and Reports always agree.
export function DateRangeProvider({ children }) {
  const [state, setState] = useState({ preset: 'this-month', ...presetRange('this-month') });
  const value = useMemo(() => ({
    range: { from: state.from, to: state.to },
    preset: state.preset,
    setPreset: (id) => setState({ preset: id, ...presetRange(id) }),
    setCustom: (from, to) => setState({ preset: 'custom', from, to }),
  }), [state]);
  return <DateRangeContext.Provider value={value}>{children}</DateRangeContext.Provider>;
}
