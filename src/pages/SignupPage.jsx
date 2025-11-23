import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const initialState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
};

export default function SignupPage() {
  const { signup, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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
      await signup({
        firstName: formValues.firstName.trim(),
        lastName: formValues.lastName.trim(),
        email: formValues.email.trim().toLowerCase(),
        phone: formValues.phone.trim(),
        password: formValues.password,
      });
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setFormError(error.message || 'Unable to create your account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabled = isSubmitting || isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-[32px] bg-white/90 p-12 shadow-2xl shadow-orange-500/10">
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

        <form className="grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              First name
              <input
                type="text"
                name="firstName"
                value={formValues.firstName}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                placeholder="Phoenix"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Last name
              <input
                type="text"
                name="lastName"
                value={formValues.lastName}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                placeholder="Host"
              />
            </label>
          </div>

          <label className="text-sm font-medium text-slate-700">
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

          <label className="text-sm font-medium text-slate-700">
            Phone number
            <input
              type="tel"
              name="phone"
              value={formValues.phone}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              placeholder="(555) 123-4567"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              value={formValues.password}
              onChange={handleChange}
              required
              minLength={8}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              placeholder="Create a strong password"
            />
          </label>

          {formError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
          )}

          <button
            type="submit"
            disabled={disabled}
            className="w-full rounded-2xl bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {disabled ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            state={{ from: redirectPath }}
            className="font-semibold text-orange-600 hover:text-orange-500"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
