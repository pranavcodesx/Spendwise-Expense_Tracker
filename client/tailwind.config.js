/** SpendWise design tokens — every page uses these, never raw hex values. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        sidebar: '#071C1C',
        brand: { DEFAULT: '#10B981', dark: '#059669' },
        ink: '#111827',
        muted: '#64748B',
        canvas: '#F5F8FC',
        line: '#E2E8F0',
        expense: '#EF4444',
        info: '#3B82F6',
        budget: { orange: '#F59E0B', purple: '#8B5CF6' },
      },
      borderRadius: { card: '1rem' },
      boxShadow: { card: '0 1px 2px rgba(15,23,42,.04), 0 4px 16px rgba(15,23,42,.04)' },
    },
  },
  plugins: [],
};
