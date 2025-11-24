import { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { SignIn } from '@clerk/clerk-react';
import { useAuth } from '../hooks/useAuth.js';

function sanitizeRedirectPath(candidate) {
  if (!candidate) {
    return '/listings';
  }
  if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
    try {
      const url = new URL(candidate);
      return `${url.pathname}${url.search}` || '/listings';
    } catch (error) {
      return '/listings';
    }
  }
  return candidate.startsWith('/') ? candidate : `/${candidate}`;
}

export default function SigninPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTarget = useMemo(() => {
    const queryValue = searchParams.get('redirectTo');
    const stateValue = typeof location.state?.from === 'string' ? location.state.from : null;
    return sanitizeRedirectPath(queryValue || stateValue || '/listings');
  }, [location.state, searchParams]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(redirectTarget, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTarget]);

  const redirectQuery = redirectTarget && redirectTarget !== '/listings' ? `?redirectTo=${encodeURIComponent(redirectTarget)}` : '';

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 lg:flex-row">
        <section className="flex-1 rounded-[32px] border border-slate-100 bg-white/90 p-10 shadow-xl shadow-orange-500/5">
          <div className="mb-8 flex items-center gap-3 text-orange-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Vendibook</p>
              <p className="text-2xl font-bold text-slate-900">Welcome back</p>
            </div>
          </div>
          <p className="text-base text-slate-600">
            Access bookings, listings, conversations, and payouts in one secure dashboard. Continue where you left off or explore new opportunities across the marketplace.
          </p>
          <div className="mt-8 grid gap-6 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-900">Hosts</p>
              <p>Manage active listings, respond to inquiries, and keep your payout profile in sync.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Renters</p>
              <p>Track booking requests, message hosts, and verify your profile for instant approvals.</p>
            </div>
          </div>
          <p className="mt-10 text-sm text-slate-600">
            New to Vendibook?{' '}
            <Link to={`/signup${redirectQuery}`} className="font-semibold text-orange-600 hover:text-orange-500">
              Create an account
            </Link>
            .
          </p>
        </section>

        <section className="flex-1 rounded-[32px] border border-slate-100 bg-white/70 p-10 shadow-2xl shadow-slate-900/5">
          <SignIn
            appearance={{
              layout: {
                socialButtonsPlacement: 'bottom',
                socialButtonsVariant: 'iconButton',
              },
              elements: {
                card: 'shadow-none border-0 bg-transparent p-0',
                headerSubtitle: 'text-slate-500',
                headerTitle: 'text-slate-900',
                formFieldLabel: 'text-slate-700 text-sm font-medium',
                formFieldInput: 'rounded-2xl border-slate-200 focus:border-orange-500 focus:ring-orange-200',
                footerActionText: 'text-slate-600',
                footerActionLink: 'text-orange-600 hover:text-orange-500',
              },
            }}
            redirectUrl={redirectTarget}
            afterSignInUrl={redirectTarget}
            signUpUrl={`/signup${redirectQuery}`}
          />
        </section>
      </div>
    </div>
  );
}
