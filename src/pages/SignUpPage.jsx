import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  interest: 'rent',
  agree: false
};

export default function SignUpPage() {
  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [bannerError, setBannerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formValues.firstName.trim()) {
      nextErrors.firstName = 'First name is required';
    }
    if (!formValues.lastName.trim()) {
      nextErrors.lastName = 'Last name is required';
    }
    if (!formValues.email.trim()) {
      nextErrors.email = 'Email is required';
    }
    if (!formValues.password.trim()) {
      nextErrors.password = 'Password is required';
    }
    if (!formValues.agree) {
      nextErrors.agree = 'You must accept the terms to continue';
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSuccessMessage('');
    const validation = validate();
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      setBannerError('Please review the highlighted fields and accept the agreements.');
      return;
    }

    setBannerError('');
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage('Your Vendibook account is ready. Redirecting to onboarding...');
      // TODO wire to real registration endpoint
      // eslint-disable-next-line no-console
      console.log('TODO: Wire sign-up form to real registration endpoint');
    }, 1500);
  };

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-200">Vendibook</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Create your Vendibook account</h1>
          <p className="mt-2 text-base text-slate-100/80">
            Start renting, booking, or listing in just a few minutes with a premium marketplace profile.
          </p>
        </div>

        {bannerError && (
          <div
            className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100"
            role="alert"
            aria-live="assertive"
          >
            {bannerError}
          </div>
        )}

        {successMessage && (
          <p className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200" aria-live="polite">
            {successMessage}
          </p>
        )}

        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="text-sm font-medium text-slate-100">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-base text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  errors.firstName ? 'border-rose-400/60 bg-rose-500/5 focus:border-rose-400 focus:ring-rose-400/30' : 'border-white/15 bg-white/5 focus:border-orange-400 focus:ring-orange-400/40'
                }`}
                placeholder="Jordan"
                value={formValues.firstName}
                onChange={updateField}
              />
              {errors.firstName && (
                <p className="mt-2 text-sm text-rose-200" aria-live="polite">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="text-sm font-medium text-slate-100">
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-base text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  errors.lastName ? 'border-rose-400/60 bg-rose-500/5 focus:border-rose-400 focus:ring-rose-400/30' : 'border-white/15 bg-white/5 focus:border-orange-400 focus:ring-orange-400/40'
                }`}
                placeholder="Rivera"
                value={formValues.lastName}
                onChange={updateField}
              />
              {errors.lastName && (
                <p className="mt-2 text-sm text-rose-200" aria-live="polite">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-slate-100">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-base text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-rose-400/60 bg-rose-500/5 focus:border-rose-400 focus:ring-rose-400/30' : 'border-white/15 bg-white/5 focus:border-orange-400 focus:ring-orange-400/40'
                }`}
                placeholder="you@vendibook.com"
                value={formValues.email}
                onChange={updateField}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-rose-200" aria-live="polite">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-slate-100">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-base text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  errors.password ? 'border-rose-400/60 bg-rose-500/5 focus:border-rose-400 focus:ring-rose-400/30' : 'border-white/15 bg-white/5 focus:border-orange-400 focus:ring-orange-400/40'
                }`}
                placeholder="Create a secure password"
                value={formValues.password}
                onChange={updateField}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-rose-200" aria-live="polite">
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="interest" className="text-sm font-medium text-slate-100">
              What brings you to Vendibook? <span className="text-slate-300">(Optional)</span>
            </label>
            <select
              id="interest"
              name="interest"
              value={formValues.interest}
              onChange={updateField}
              className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
            >
              <option value="rent">I want to rent food trucks or vendor spaces</option>
              <option value="list">I want to list my truck or trailer</option>
              <option value="event-pro">I want to book or sell Event Pro services</option>
              <option value="explore">I am exploring options</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 text-sm text-slate-100">
              <input
                type="checkbox"
                name="agree"
                checked={formValues.agree}
                onChange={updateField}
                className="mt-1 h-4 w-4 rounded border-white/30 bg-white/10 text-orange-500 focus:ring-2 focus:ring-orange-400/40"
              />
              <span>
                I agree to the{' '}
                <Link to="/terms" className="font-semibold text-orange-300 hover:text-orange-200">
                  Terms of Use
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="font-semibold text-orange-300 hover:text-orange-200">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.agree && (
              <p className="text-sm text-rose-200" aria-live="assertive">
                {errors.agree}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating your account…' : 'Create account'}
          </button>

          <p className="text-center text-sm text-slate-300">
            Already have an account?{' '}
            <Link to="/signin" className="font-semibold text-orange-300 hover:text-orange-200">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
