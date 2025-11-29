import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSignIn, useAuth } from '@clerk/clerk-react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { clerkPublishableKey } from '../config/clerkConfig';

const clerkEnabled = Boolean(clerkPublishableKey);

function SignInContent({ children }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Welcome back
        </h1>
        <p className="text-slate-600">
          Sign in to access your listings, bookings, and dashboard.
        </p>
      </div>
      {children}
    </div>
  );
}

function ClerkSignInForm() {
  const [formValues, setFormValues] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const { isLoaded, signIn } = useSignIn();
  const { setActive } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isLoaded) return;
    setIsSubmitting(true);
    setFormError('');

    try {
      const result = await signIn.create({
        identifier: formValues.email,
        password: formValues.password
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate(redirectTo, { replace: true });
      } else {
        setFormError('Additional verification is required. Please continue in the verification flow.');
      }
    } catch (error) {
      const clerkError = error?.errors?.[0]?.message;
      setFormError(clerkError || 'We could not sign you in with those credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <SignInContent>
        {/* Error Banner */}
        {formError && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700" role="alert">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{formError}</p>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-orange-500 focus:ring-orange-500/20 transition-all"
                placeholder="you@example.com"
                value={formValues.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <Link to="/forgot-password" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-orange-500 focus:ring-orange-500/20 transition-all"
                placeholder="Enter your password"
                value={formValues.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !isLoaded}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-orange-500 hover:text-orange-600 font-semibold">
              Create one
            </Link>
          </p>
        </form>
      </SignInContent>
    </AuthLayout>
  );
}

function SignInDisabledNotice() {
  return (
    <AuthLayout>
      <SignInContent>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="font-semibold text-amber-800 mb-2">Authentication not configured</h3>
          <p className="text-sm text-amber-700 mb-4">
            Add your Clerk API keys to enable sign in. See the documentation for setup instructions.
          </p>
          <ul className="text-sm text-amber-600 space-y-1 list-disc list-inside">
            <li>Add <code className="font-mono bg-amber-100 px-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code></li>
            <li>Add <code className="font-mono bg-amber-100 px-1 rounded">VITE_CLERK_FRONTEND_API</code></li>
            <li>Restart the dev server</li>
          </ul>
        </div>
        <p className="text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-orange-500 hover:text-orange-600 font-semibold">
            Create one
          </Link>
        </p>
      </SignInContent>
    </AuthLayout>
  );
}

export default function SignInPage() {
  return clerkEnabled ? <ClerkSignInForm /> : <SignInDisabledNotice />;
}
