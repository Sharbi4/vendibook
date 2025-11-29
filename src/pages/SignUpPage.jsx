import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSignUp, useAuth } from '@clerk/clerk-react';
import { Mail, Lock, User, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { clerkPublishableKey } from '../config/clerkConfig';

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  interest: 'rent',
  agree: false
};

const clerkEnabled = Boolean(clerkPublishableKey);

function SignUpContent({ children }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Create your account
        </h1>
        <p className="text-slate-600">
          Join thousands of food entrepreneurs. Start renting, booking, or listing today.
        </p>
      </div>
      {children}
    </div>
  );
}

function validate(values) {
  const nextErrors = {};

  if (!values.firstName.trim()) {
    nextErrors.firstName = 'First name is required';
  }
  if (!values.lastName.trim()) {
    nextErrors.lastName = 'Last name is required';
  }
  if (!values.email.trim()) {
    nextErrors.email = 'Email is required';
  }
  if (!values.password.trim()) {
    nextErrors.password = 'Password is required';
  } else if (values.password.length < 8) {
    nextErrors.password = 'Password must be at least 8 characters';
  }
  if (!values.agree) {
    nextErrors.agree = 'You must accept the terms to continue';
  }

  return nextErrors;
}

function ClerkSignUpForm() {
  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [bannerError, setBannerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const { isLoaded, signUp } = useSignUp();
  const { setActive } = useAuth();

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validate(formValues);
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      setBannerError('Please review the highlighted fields.');
      return;
    }

    setBannerError('');
    if (!isLoaded) return;
    setIsSubmitting(true);

    try {
      await signUp.create({
        emailAddress: formValues.email,
        password: formValues.password
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setAwaitingVerification(true);
    } catch (error) {
      const clerkError = error?.errors?.[0]?.message;
      setBannerError(clerkError || 'We could not start your registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (event) => {
    event.preventDefault();
    if (!isLoaded) return;
    setIsVerifying(true);
    setBannerError('');

    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verificationCode });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate(redirectTo, { replace: true });
      } else {
        setBannerError('Additional verification is required.');
      }
    } catch (error) {
      const clerkError = error?.errors?.[0]?.message;
      setBannerError(clerkError || 'That verification code did not work. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AuthLayout>
      <SignUpContent>
        {/* Error Banner */}
        {bannerError && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700" role="alert">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{bannerError}</p>
          </div>
        )}

        <form className="space-y-5" onSubmit={awaitingVerification ? handleCodeSubmit : handleSubmit} noValidate>
          {/* Name Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1.5">
                First name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  disabled={awaitingVerification}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.firstName 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-slate-200 focus:border-orange-500 focus:ring-orange-500/20'
                  }`}
                  placeholder="Jordan"
                  value={formValues.firstName}
                  onChange={updateField}
                />
              </div>
              {errors.firstName && (
                <p className="mt-1.5 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1.5">
                Last name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  disabled={awaitingVerification}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.lastName 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-slate-200 focus:border-orange-500 focus:ring-orange-500/20'
                  }`}
                  placeholder="Rivera"
                  value={formValues.lastName}
                  onChange={updateField}
                />
              </div>
              {errors.lastName && (
                <p className="mt-1.5 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

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
                disabled={awaitingVerification}
                className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-slate-200 focus:border-orange-500 focus:ring-orange-500/20'
                }`}
                placeholder="you@example.com"
                value={formValues.email}
                onChange={updateField}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="password"
                name="password"
                type="password"
                disabled={awaitingVerification}
                className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.password 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-slate-200 focus:border-orange-500 focus:ring-orange-500/20'
                }`}
                placeholder="Create a secure password"
                value={formValues.password}
                onChange={updateField}
              />
            </div>
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
            )}
            <p className="mt-1.5 text-xs text-slate-500">At least 8 characters</p>
          </div>

          {/* Interest */}
          <div>
            <label htmlFor="interest" className="block text-sm font-medium text-slate-700 mb-1.5">
              What brings you to Vendibook?
            </label>
            <div className="relative">
              <select
                id="interest"
                name="interest"
                value={formValues.interest}
                onChange={updateField}
                disabled={awaitingVerification}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:border-orange-500 focus:ring-orange-500/20"
              >
                <option value="rent">I want to rent food trucks or spaces</option>
                <option value="list">I want to list my equipment</option>
                <option value="event-pro">I'm an event pro offering services</option>
                <option value="explore">Just exploring</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Terms Checkbox */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="agree"
                checked={formValues.agree}
                onChange={updateField}
                disabled={awaitingVerification}
                className="mt-0.5 w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500/20"
              />
              <span className="text-sm text-slate-600">
                I agree to the{' '}
                <Link to="/terms" className="text-orange-500 hover:text-orange-600 font-medium">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-orange-500 hover:text-orange-600 font-medium">Privacy Policy</Link>
              </span>
            </label>
            {errors.agree && (
              <p className="mt-1.5 text-sm text-red-600">{errors.agree}</p>
            )}
          </div>

          {/* Submit Button */}
          {!awaitingVerification && (
            <button
              type="submit"
              disabled={isSubmitting || !isLoaded}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          )}

          {/* Verification Code */}
          {awaitingVerification && (
            <div className="space-y-4 bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <div className="flex items-center gap-3 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                <p className="text-sm font-medium">Check your email</p>
              </div>
              <p className="text-sm text-emerald-600">
                We sent a 6-digit code to <strong>{formValues.email}</strong>
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-emerald-300 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-emerald-500 focus:ring-emerald-500/20 text-center text-lg tracking-widest font-mono"
                placeholder="000000"
              />
              <button
                type="submit"
                disabled={isVerifying || verificationCode.length < 6}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isVerifying ? 'Verifying...' : 'Verify & continue'}
              </button>
            </div>
          )}

          {/* Sign In Link */}
          <p className="text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/signin" className="text-orange-500 hover:text-orange-600 font-semibold">
              Sign in
            </Link>
          </p>
        </form>
      </SignUpContent>
    </AuthLayout>
  );
}

function SignUpDisabledNotice() {
  return (
    <AuthLayout>
      <SignUpContent>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="font-semibold text-amber-800 mb-2">Authentication not configured</h3>
          <p className="text-sm text-amber-700 mb-4">
            Add your Clerk API keys to enable sign up. See the documentation for setup instructions.
          </p>
          <ul className="text-sm text-amber-600 space-y-1 list-disc list-inside">
            <li>Add <code className="font-mono bg-amber-100 px-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code></li>
            <li>Add <code className="font-mono bg-amber-100 px-1 rounded">VITE_CLERK_FRONTEND_API</code></li>
            <li>Restart the dev server</li>
          </ul>
        </div>
        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/signin" className="text-orange-500 hover:text-orange-600 font-semibold">
            Sign in
          </Link>
        </p>
      </SignUpContent>
    </AuthLayout>
  );
}

export default function SignUpPage() {
  return clerkEnabled ? <ClerkSignUpForm /> : <SignUpDisabledNotice />;
}
