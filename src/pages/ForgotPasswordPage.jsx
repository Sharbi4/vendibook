import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle, Menu, X } from 'lucide-react';

// Food truck themed background - consistent with Vendibook branding
const heroImage = 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&w=2400&q=80';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    // Simulate API call - replace with your actual password reset logic
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch (error) {
      setFormError('We could not send a reset link. Please check your email and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigate = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <div className="relative min-h-screen">
      {/* Full-screen background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Food truck scene"
          className="h-full w-full object-cover"
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Header - Matching AppHeader style */}
      <header className="relative z-20 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          {/* Logo */}
          <Link to="/" className="group flex items-center" aria-label="Vendibook home">
            <img 
              src="https://k6dbqk6vsjuxeqeq.public.blob.vercel-storage.com/vendibook%20%20logo%20transparent.png" 
              alt="Vendibook" 
              className="h-10 w-auto brightness-0 invert transition-transform group-hover:scale-[1.02] sm:h-11"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              to="/"
              className="rounded-full px-4 py-2 text-[14px] font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="rounded-full px-4 py-2 text-[14px] font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            >
              About
            </Link>
            <Link
              to="/community"
              className="rounded-full px-4 py-2 text-[14px] font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            >
              Community
            </Link>
            <Link
              to="/signin"
              className="rounded-full px-4 py-2 text-[14px] font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-[#FF5124] px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(255,81,36,0.25)] transition-all hover:bg-[#E94A1F] hover:shadow-[0_4px_16px_rgba(255,81,36,0.35)]"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex items-center rounded-full border border-white/20 bg-white/10 p-2.5 text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden">
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
                  onClick={() => handleNavigate('/')}
                  className="rounded-2xl px-4 py-3 text-left text-base font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('/about')}
                  className="rounded-2xl px-4 py-3 text-left text-base font-semibold text-slate-700 hover:bg-slate-50"
                >
                  About
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('/community')}
                  className="rounded-2xl px-4 py-3 text-left text-base font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Community
                </button>
              </nav>
              <div className="border-t border-slate-200 px-5 py-4">
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
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Centered card */}
      <div className="relative z-10 flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          {isSuccess ? (
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
                  className="w-full rounded-full bg-[#FF5124] px-4 py-3 font-semibold text-white shadow-[0_2px_8px_rgba(255,81,36,0.25)] transition-all hover:bg-[#E94A1F] hover:shadow-[0_4px_16px_rgba(255,81,36,0.35)] focus:outline-none focus:ring-2 focus:ring-[#FF5124]/40"
                >
                  Try another email
                </button>
                <Link
                  to="/signin"
                  className="block w-full rounded-full border border-gray-200 bg-white px-4 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                  <Mail className="h-8 w-8 text-[#FF5124]" />
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
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#FF5124] focus:outline-none focus:ring-2 focus:ring-[#FF5124]/40"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-[#FF5124] px-4 py-3 font-semibold text-white shadow-[0_2px_8px_rgba(255,81,36,0.25)] transition-all hover:bg-[#E94A1F] hover:shadow-[0_4px_16px_rgba(255,81,36,0.35)] focus:outline-none focus:ring-2 focus:ring-[#FF5124]/40 disabled:cursor-not-allowed disabled:opacity-60"
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
          )}
        </div>
      </div>
    </div>
  );
}
