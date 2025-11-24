import { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Truck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

const BASE_LINKS = [
  { label: 'Rent Equipment', path: '/listings' },
  { label: 'Buy Equipment', path: '/listings?listingType=sale' },
  { label: 'Become a Host', path: '/become-host' },
  { label: 'Community', path: '/community' },
];

const HIDDEN_PATHS = new Set(['/signin', '/signup']);

function buildRedirect(location) {
  const next = `${location.pathname || ''}${location.search || ''}`;
  if (!next || next === '/') {
    return '';
  }
  return `?redirectTo=${encodeURIComponent(next)}`;
}

export default function SiteHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const shouldHide = useMemo(() => {
    return Array.from(HIDDEN_PATHS).some((path) => location.pathname.startsWith(path));
  }, [location.pathname]);

  const navLinks = useMemo(() => {
    if (isAuthenticated) {
      return [...BASE_LINKS, { label: 'Profile', path: '/profile' }];
    }
    return BASE_LINKS;
  }, [isAuthenticated]);

  if (shouldHide) {
    return null;
  }

  const redirectQuery = buildRedirect(location);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between gap-6 px-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 rounded-full px-2 py-1 text-orange-500 transition hover:text-orange-600"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white">
            <Truck className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <span className="text-2xl font-bold tracking-tight">vendibook</span>
        </button>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="transition hover:text-orange-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <SignedIn>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonPopoverCard: 'shadow-xl border border-slate-100' } }} />
          </SignedIn>
          <SignedOut>
            <button
              type="button"
              onClick={() => navigate(`/signin${redirectQuery}`)}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:text-orange-600"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => navigate(`/signup${redirectQuery}`)}
              className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:shadow-orange-500/50"
            >
              Get started
            </button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
