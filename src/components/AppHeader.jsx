import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Rent Equipment', to: '/listings?mode=rent' },
  { label: 'Buy Equipment', to: '/listings?mode=sale' },
  { label: 'Become a Host', to: '/become-host' },
  { label: 'Community', to: '/community' },
  { label: 'Dashboard', to: '/host/dashboard' },
  { label: 'Profile', to: '/profile' }
];

function AppHeader({ className = '' }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const authButtons = (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => handleNavigate('/signin')}
        className="text-sm font-semibold text-slate-700 transition hover:text-slate-900"
      >
        Sign in
      </button>
      <button
        type="button"
        onClick={() => handleNavigate('/signup')}
        className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
      >
        Sign up
      </button>
    </div>
  );

  return (
    <header className={`sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur ${className}`}>
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="Vendibook home">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md">
            <span className="text-lg font-bold">vb</span>
          </div>
          <div className="leading-tight">
            <p className="text-base font-bold tracking-tight text-slate-900">vendibook</p>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">marketplace</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm font-semibold transition ${
                  isActive ? 'bg-slate-900/5 text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex">{authButtons}</div>

        <button
          type="button"
          className="inline-flex items-center rounded-full border border-slate-200 p-2 text-slate-700 lg:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="lg:hidden">
          <div className="space-y-4 border-t border-slate-200 bg-white px-4 py-6">
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleNavigate(link.to)}
                  className="w-full rounded-xl px-4 py-3 text-left text-base font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {link.label}
                </button>
              ))}
            </nav>
            {authButtons}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default AppHeader;
