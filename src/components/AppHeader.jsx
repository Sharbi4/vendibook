import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { clerkPublishableKey } from '../config/clerkConfig';

// Minimal header nav – mode links removed per spec
const NAV_LINKS_PUBLIC = [
  { label: 'Community', to: '/community' }
];

const NAV_LINKS_AUTH = [
  { label: 'Community', to: '/community' },
  { label: 'Dashboard', to: '/host/dashboard' }
];

function AppHeader({ className = '' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const clerkEnabled = Boolean(clerkPublishableKey);

  const handleNavigate = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const signedOutButtons = (
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

  const signedInButtons = (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => handleNavigate('/messages')}
        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
      >
        Inbox
      </button>
      <button
        type="button"
        onClick={() => handleNavigate('/host/dashboard')}
        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
      >
        Dashboard
      </button>
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: 'h-9 w-9',
            userButtonPopoverMain: 'min-w-[220px]'
          }
        }}
      />
    </div>
  );

  const activeLinkMap = useMemo(() => {
    const allLinks = [...NAV_LINKS_PUBLIC, ...NAV_LINKS_AUTH];
    return allLinks.reduce((acc, link) => {
      acc[link.label] = location.pathname === link.to;
      return acc;
    }, {});
  }, [location.pathname]);

  const navButton = (link) => (
    <button
      key={link.label}
      type="button"
      onClick={() => handleNavigate(link.to)}
      className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
        activeLinkMap[link.label] ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      {link.label}
    </button>
  );

  return (
    <header className={`sticky top-0 z-40 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur ${className}`}>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="Vendibook home">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md">
            <span className="text-lg font-bold">vb</span>
          </div>
          <div className="leading-tight">
            <p className="text-base font-bold tracking-tight text-slate-900">vendibook</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-orange-500">marketplace</p>
          </div>
        </Link>

        {/* Right side: Community, Sign in, Sign up – vertically aligned */}
        <div className="hidden items-center gap-4 xl:flex">
          <button
            type="button"
            onClick={() => handleNavigate('/community')}
            className="text-sm font-semibold text-slate-700 transition hover:text-slate-900"
          >
            Community
          </button>
          {clerkEnabled ? (
            <>
              <SignedIn>{signedInButtons}</SignedIn>
              <SignedOut>
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
                  className="rounded-full bg-[#FF5124] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E5491F]"
                >
                  Sign up
                </button>
              </SignedOut>
            </>
          ) : (
            <>
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
                className="rounded-full bg-[#FF5124] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E5491F]"
              >
                Sign up
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center rounded-full border border-slate-200 p-2 text-slate-700 xl:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="xl:hidden">
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md">
                  <span className="text-lg font-bold">vb</span>
                </div>
                <p className="text-base font-bold tracking-tight text-slate-900">vendibook</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-600"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-6">
              {NAV_LINKS_PUBLIC.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleNavigate(link.to)}
                  className={`rounded-2xl px-4 py-3 text-left text-base font-semibold ${
                    activeLinkMap[link.label]
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              {clerkEnabled && (
                <SignedIn>
                  {NAV_LINKS_AUTH.filter(l => l.label !== 'Community').map((link) => (
                    <button
                      key={link.label}
                      type="button"
                      onClick={() => handleNavigate(link.to)}
                      className={`rounded-2xl px-4 py-3 text-left text-base font-semibold ${
                        activeLinkMap[link.label]
                          ? 'bg-orange-50 text-orange-600'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                </SignedIn>
              )}
            </nav>
            <div className="border-t border-slate-200 px-5 py-4">
              {clerkEnabled ? (
                <>
                  <SignedIn>{signedInButtons}</SignedIn>
                  <SignedOut>{signedOutButtons}</SignedOut>
                </>
              ) : (
                signedOutButtons
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default AppHeader;
