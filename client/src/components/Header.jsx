import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, Search } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { initials } from '../utils/format';

export default function Header({ onMenu }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [bellOpen, setBellOpen] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/transactions?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <button onClick={onMenu} aria-label="Open menu" className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-white lg:hidden">
        <Menu className="h-5 w-5" />
      </button>

      <form onSubmit={submit} role="search" className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search transactions"
          placeholder="Search transactions, categories..."
          className="min-h-[44px] w-full rounded-xl border border-line bg-white pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </form>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <div className="relative">
          <button onClick={() => setBellOpen((o) => !o)} aria-label="Notifications" aria-expanded={bellOpen} className="grid h-11 w-11 place-items-center rounded-xl hover:bg-white">
            <Bell className="h-5 w-5" />
          </button>
          {bellOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-line bg-white p-4 text-sm text-muted shadow-card">
              You have no new notifications.
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-sm font-bold text-white">{initials(user.name)}</span>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-muted">{user.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
