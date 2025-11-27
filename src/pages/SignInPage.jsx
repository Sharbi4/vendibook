import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, CalendarDays, Coins } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';

const featureHighlights = [
  {
    icon: Truck,
    label: 'Rent food trucks for a weekend'
  },
  {
    icon: CalendarDays,
    label: 'Book Event Pros for launches'
  },
  {
    icon: Coins,
    label: 'Monetize your truck or trailer'
  }
];

export default function SignInPage() {
  const [formValues, setFormValues] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    setTimeout(() => {
      setIsSubmitting(false);
      setStatusMessage('Signed in successfully. Redirecting to your dashboard...');
      // TODO wire to real auth endpoint
      // eslint-disable-next-line no-console
      console.log('TODO: Wire sign-in form to real authentication endpoint');
    }, 1300);
  };

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-200">Vendibook</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Sign in to Vendibook</h1>
          <p className="mt-2 text-base text-slate-100/80">
            Access your rentals, bookings, and vendor listings in one single dashboard.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-slate-100">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
                placeholder="you@vendibook.com"
                value={formValues.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-slate-100">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-orange-300 hover:text-orange-200">
                  Forgot your password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
                placeholder="Enter a secure password"
                value={formValues.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing you in…' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-slate-300">
            Do not have an account yet?{' '}
            <Link to="/signup" className="font-semibold text-orange-300 hover:text-orange-200">
              Sign up
            </Link>
          </p>
        </form>

        {statusMessage && (
          <p className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200" aria-live="polite">
            {statusMessage}
          </p>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-orange-200">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-300" />
            <span>Inside Vendibook</span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {featureHighlights.map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-xl bg-slate-900/60 px-3 py-4 text-sm text-slate-100/90">
                <div className="mb-2 inline-flex items-center gap-2 text-orange-200">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-widest">Feature</span>
                </div>
                <p>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
