import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { clerkPublishableKey } from '../config/clerkConfig';

function AppHeader({ className = '' }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const clerkEnabled = Boolean(clerkPublishableKey);

  const handleNavigate = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <header className={`sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl ${className}`}>
      <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Left: Logo */}
        <Link to="/" className="group flex items-center" aria-label="Vendibook home">
          <img 
            src="https://k6dbqk6vsjuxeqeq.public.blob.vercel-storage.com/vendibook%20%20logo%20transparent.png" 
            alt="Vendibook" 
            className="h-10 w-auto transition-transform group-hover:scale-[1.02] sm:h-11"
          />
        </Link>

        {/* Right: Community + Sign in + Sign up (far right) */}
        <div className="hidden items-center gap-4 xl:flex">
          <button
            type="button"
            onClick={() => handleNavigate('/community')}
            className="rounded-full px-4 py-2 text-[14px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Community
          </button>
          {clerkEnabled ? (
            <>
              <SignedIn>
                <button
                  type="button"
                  onClick={() => handleNavigate('/messages')}
                  className="rounded-full border border-slate-200 px-4 py-2 text-[14px] font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Inbox
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('/host/dashboard')}
                  className="rounded-full bg-slate-900 px-4 py-2 text-[14px] font-semibold text-white shadow-sm transition hover:bg-slate-800"
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
              </SignedIn>
              <SignedOut>
                <button
                  type="button"
                  onClick={() => handleNavigate('/signin')}
                  className="rounded-full px-4 py-2 text-[14px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('/signup')}
                  className="rounded-full bg-[#FF5124] px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(255,81,36,0.25)] transition-all hover:bg-[#E94A1F] hover:shadow-[0_4px_16px_rgba(255,81,36,0.35)]"
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
                className="rounded-full px-4 py-2 text-[14px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/signup')}
                className="rounded-full bg-[#FF5124] px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(255,81,36,0.25)] transition-all hover:bg-[#E94A1F] hover:shadow-[0_4px_16px_rgba(255,81,36,0.35)]"
              >
                Sign up
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center rounded-full border border-slate-200 p-2 text-slate-700 xl:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="xl:hidden">
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center">
                <img 
                  src="https://k6dbqk6vsjuxeqeq.public.blob.vercel-storage.com/vendibook%20%20logo%20transparent.png" 
                  alt="Vendibook" 
                  className="h-9 w-auto"
                />
              </Link>
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
              <button
                type="button"
                onClick={() => handleNavigate('/community')}
                className="rounded-2xl px-4 py-3 text-left text-base font-semibold text-slate-700 hover:bg-slate-50"
              >
                Community
              </button>
              {clerkEnabled && (
                <SignedIn>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/host/dashboard')}
                    className="rounded-2xl px-4 py-3 text-left text-base font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Dashboard
                  </button>
                </SignedIn>
              )}
            </nav>
            <div className="border-t border-slate-200 px-5 py-4">
              {clerkEnabled ? (
                <>
                  <SignedIn>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleNavigate('/messages')}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                      >
                        Inbox
                      </button>
                      <UserButton
                        afterSignOutUrl="/"
                        appearance={{ elements: { avatarBox: 'h-9 w-9' } }}
                      />
                    </div>
                  </SignedIn>
                  <SignedOut>
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
                        className="rounded-full bg-[#FF5124] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E94A1F]"
                      >
                        Sign up
                      </button>
                    </div>
                  </SignedOut>
                </>
              ) : (
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
                    className="rounded-full bg-[#FF5124] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E94A1F]"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default AppHeader;
