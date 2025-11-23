import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const initialState = {
  email: '',
  password: '',
};

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [formValues, setFormValues] = useState(initialState);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = useMemo(() => {
    if (typeof location.state?.from === 'string' && location.state.from.length) {
      return location.state.from;
    }
    return '/profile';
  }, [location.state]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      await login({
        email: formValues.email.trim().toLowerCase(),
        password: formValues.password,
      });
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setFormError(error.message || 'Unable to log in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabled = isSubmitting || isLoading;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-10 flex items-center justify-center gap-3 text-orange-500">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Vendibook</p>
            <p className="text-2xl font-bold text-slate-900">Welcome back</p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-10 shadow-xl shadow-orange-500/5">
          <div className="mb-8 space-y-2 text-center">
            <h1 className="text-3xl font-semibold text-slate-900">Log in</h1>
            <p className="text-sm text-slate-500">Access your bookings, listings, and conversations in one place.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700">
              Email address
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={formValues.email}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                placeholder="you@vendibook.com"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={formValues.password}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                placeholder="••••••••"
              />
            </label>

            {formError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
            )}

            <button
              type="submit"
              disabled={disabled}
              className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {disabled ? 'Signing in…' : 'Log in'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            state={{ from: redirectPath }}
            className="font-semibold text-orange-600 hover:text-orange-500"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
