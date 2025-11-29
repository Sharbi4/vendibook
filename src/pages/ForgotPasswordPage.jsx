import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSignIn } from '@clerk/clerk-react';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { clerkPublishableKey } from '../config/clerkConfig';

const clerkEnabled = Boolean(clerkPublishableKey);

// Beautiful cabin/nature background similar to reference
const heroImage = 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=2000&q=80';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const { isLoaded, signIn } = useSignIn();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsSubmitting(true);
    setFormError('');

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setIsSuccess(true);
    } catch (error) {
      console.error('Password reset error:', error);
      const clerkError = error?.errors?.[0]?.message;
      setFormError(clerkError || 'We could not send a reset link. Please check your email and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">Check your email</h2>
        <p className="mt-3 text-gray-600">
          We've sent a password reset link to <span className="font-medium text-gray-900">{email}</span>
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Didn't receive the email? Check your spam folder or try again.
        </p>
        <div className="mt-8 space-y-3">
          <button
            onClick={() => {
              setIsSuccess(false);
              setEmail('');
            }}
            className="w-full rounded-xl bg-coral-500 px-4 py-3 font-semibold text-white shadow-lg shadow-coral-500/30 transition hover:bg-coral-600 focus:outline-none focus:ring-2 focus:ring-coral-400"
          >
            Try another email
          </button>
          <Link
            to="/signin"
            className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-coral-100">
          <Mail className="h-8 w-8 text-coral-500" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">Forgot your password?</h2>
        <p className="mt-3 text-gray-600">
          No worries! Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {formError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400/40"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isLoaded}
          className="w-full rounded-xl bg-coral-500 px-4 py-3 font-semibold text-white shadow-lg shadow-coral-500/30 transition hover:bg-coral-600 focus:outline-none focus:ring-2 focus:ring-coral-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Sending reset link...' : 'Send reset link'}
        </button>

        <Link
          to="/signin"
          className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </form>
    </>
  );
}

function ForgotPasswordDisabled() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
        <Mail className="h-8 w-8 text-amber-600" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900">Password Reset Unavailable</h2>
      <p className="mt-3 text-gray-600">
        Authentication is currently disabled. Please contact support if you need to reset your password.
      </p>
      <Link
        to="/signin"
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-coral-500 transition hover:text-coral-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="relative min-h-screen">
      {/* Full-screen background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Cozy cabin in autumn forest"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Header */}
      <header className="relative z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-500">
              <span className="text-lg font-bold text-white">V</span>
            </div>
            <span className="text-xl font-semibold text-white">Vendibook</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/" className="text-sm font-medium text-white/90 transition hover:text-white">
              Home
            </Link>
            <Link to="/about" className="text-sm font-medium text-white/90 transition hover:text-white">
              About
            </Link>
            <Link to="/blog" className="text-sm font-medium text-white/90 transition hover:text-white">
              Blog
            </Link>
            <Link to="/contact" className="text-sm font-medium text-white/90 transition hover:text-white">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      {/* Centered card */}
      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          {clerkEnabled ? <ForgotPasswordForm /> : <ForgotPasswordDisabled />}
        </div>
      </div>

      {/* Custom styles for coral color */}
      <style>{`
        .bg-coral-100 { background-color: #fff1f0; }
        .bg-coral-500 { background-color: #ff6b6b; }
        .hover\\:bg-coral-600:hover { background-color: #ee5a5a; }
        .text-coral-500 { color: #ff6b6b; }
        .hover\\:text-coral-600:hover { color: #ee5a5a; }
        .border-coral-400 { border-color: #ff8585; }
        .ring-coral-400 { --tw-ring-color: #ff8585; }
        .ring-coral-400\\/40 { --tw-ring-color: rgb(255 133 133 / 0.4); }
        .shadow-coral-500\\/30 { --tw-shadow-color: rgb(255 107 107 / 0.3); }
        .focus\\:border-coral-400:focus { border-color: #ff8585; }
        .focus\\:ring-coral-400:focus { --tw-ring-color: #ff8585; }
        .focus\\:ring-coral-400\\/40:focus { --tw-ring-color: rgb(255 133 133 / 0.4); }
      `}</style>
    </div>
  );
}
