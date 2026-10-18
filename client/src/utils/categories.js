import { Banknote, Briefcase, GraduationCap, Gamepad2, HeartPulse, Laptop, MoreHorizontal, PiggyBank, Plane, ShoppingBag, TrendingUp, UtensilsCrossed, Zap } from 'lucide-react';

export const EXPENSE_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Others'];
export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investments', 'Other Income'];
export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
export const PAYMENT_METHODS = ['UPI', 'Cash', 'Card', 'Bank Transfer', 'Net Banking'];
export const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

// One colour + icon per category, reused by badges, charts and budget bars.
export const categoryMeta = {
  Food: { color: '#F97316', icon: UtensilsCrossed },
  Travel: { color: '#3B82F6', icon: Plane },
  Shopping: { color: '#8B5CF6', icon: ShoppingBag },
  Bills: { color: '#EAB308', icon: Zap },
  Entertainment: { color: '#EC4899', icon: Gamepad2 },
  Health: { color: '#14B8A6', icon: HeartPulse },
  Education: { color: '#6366F1', icon: GraduationCap },
  Others: { color: '#94A3B8', icon: MoreHorizontal },
  Salary: { color: '#10B981', icon: Banknote },
  Freelance: { color: '#0EA5E9', icon: Laptop },
  Business: { color: '#22C55E', icon: Briefcase },
  Investments: { color: '#A855F7', icon: TrendingUp },
  'Other Income': { color: '#10B981', icon: PiggyBank },
};
export const getCategory = (name) => categoryMeta[name] || categoryMeta.Others;

export const methodColors = { UPI: '#7C3AED', Cash: '#16A34A', Card: '#D97706', 'Bank Transfer': '#2563EB', 'Net Banking': '#0D9488' };
