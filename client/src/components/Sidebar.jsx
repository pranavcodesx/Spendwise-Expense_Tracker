import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowLeftRight, BarChart3, FileText, LayoutDashboard, LogOut, Settings, Sprout, Target } from 'lucide-react';
import Logo from './Logo';
import useAuth from '../hooks/useAuth';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budgets', label: 'Budgets', icon: Target },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate();
  const { logout: signOut } = useAuth();
  const logout = async () => { await signOut(); navigate('/login'); };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-sidebar px-4 py-6 text-slate-300">
      <div className="px-2"><Logo light /></div>

      <nav aria-label="Main" className="mt-8 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${isActive ? 'bg-brand/15 text-white ring-1 ring-brand/30' : 'hover:bg-white/5 hover:text-white'}`
            }
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-8">
        <div className="rounded-2xl border border-brand/30 bg-white/[0.03] p-5 text-center">
          <Sprout className="mx-auto h-9 w-9 text-brand" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-white">Better Money<br />Better Future</p>
          <p className="mt-2 text-xs text-slate-400">Small steps today, big savings tomorrow!</p>
        </div>
        <button onClick={logout} className="mt-4 flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 text-sm font-medium hover:bg-white/5 hover:text-white">
          <LogOut className="h-5 w-5" aria-hidden="true" /> Logout
        </button>
      </div>
    </div>
  );
}
