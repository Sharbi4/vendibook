import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

function sanitizeRedirectPath(candidate) {
  if (!candidate) {
    return '/profile';
  }
  if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
    try {
      const url = new URL(candidate);
      return `${url.pathname}${url.search}` || '/profile';
    } catch (error) {
      return '/profile';
    }
  }
  return candidate.startsWith('/') ? candidate : `/${candidate}`;
}

export default function SignupPage() {
  const { isAuthenticated, isLoading, register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '' });
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const redirectTarget = useMemo(() => {
    const queryValue = searchParams.get('redirectTo');
    const stateValue = typeof location.state?.from === 'string' ? location.state.from : null;
    return sanitizeRedirectPath(queryValue || stateValue || '/profile');
  }, [location.state, searchParams]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(redirectTarget, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTarget]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      await register(form);
      navigate('/profile', { replace: true });
    } catch (error) {
      setSubmitError(error.message || 'Unable to sign up');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white px-4 py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 lg:flex-row">
        <section className="flex-1 rounded-[32px] bg-white/90 p-12 shadow-2xl shadow-orange-500/10">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Vendibook</p>
              <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
            </div>
          </div>

          <p className="mb-10 text-base text-slate-600">
            Build your marketplace presence in minutes. Track bookings, manage listings, and stay connected with renters across every activation.
          </p>

          <ul className="space-y-4 text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
              <span>Secure email and password sign up with JWT-backed sessions.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
              <span>Host-ready onboarding with Stripe KYC, messaging, and real-time notifications.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
              <span>Renter tools for saved searches, wishlists, and instant booking requests.</span>
            </li>
          </ul>

          <p className="mt-10 text-sm text-slate-600">
            Already have an account?{' '}
            <Link to={`/signin${redirectTarget ? `?redirectTo=${encodeURIComponent(redirectTarget)}` : ''}`} className="font-semibold text-orange-600 hover:text-orange-500">
              Sign in
            </Link>
            .
          </p>
        </section>

        <section className="flex-1 rounded-[32px] border border-slate-100 bg-white/90 p-10 shadow-xl shadow-orange-500/5">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-orange-500 focus:ring-orange-200"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-orange-500 focus:ring-orange-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-orange-500 focus:ring-orange-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-orange-500 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-orange-500 focus:ring-orange-200"
              />
            </div>
            {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
