import { Outlet } from 'react-router-dom';
import { BarChart3, ShieldCheck, Target } from 'lucide-react';
import Logo from '../components/Logo';

const benefits = [
  { icon: BarChart3, text: 'See exactly where every rupee goes' },
  { icon: Target, text: 'Set monthly budgets and stay on track' },
  { icon: ShieldCheck, text: 'Your financial data is yours alone' },
];

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <main className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <Outlet />
        </div>
      </main>

      <aside className="relative hidden overflow-hidden bg-sidebar p-14 text-white lg:flex lg:flex-col lg:justify-center">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand/20 blur-3xl" aria-hidden="true" />
        <h2 className="relative max-w-sm text-4xl font-bold leading-tight">Better money.<br />Better future.</h2>
        <p className="relative mt-4 max-w-sm text-slate-400">Small steps today, big savings tomorrow.</p>
        <ul className="relative mt-10 space-y-5">
          {benefits.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/15 text-brand"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <span className="text-slate-200">{text}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
