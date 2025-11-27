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

function SignUpLayout({ children }) {
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

        {children}
      </div>
    </AuthLayout>
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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validate(formValues);
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      setBannerError('Please review the highlighted fields and accept the agreements.');
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
    <SignUpLayout>
      {bannerError && (
        <div
          className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100"
          role="alert"
          aria-live="assertive"
        >
          {bannerError}
        </div>
      )}

      <form className="space-y-6" onSubmit={awaitingVerification ? handleCodeSubmit : handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="text-sm font-medium text-slate-100">
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              disabled={awaitingVerification}
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
              disabled={awaitingVerification}
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
              disabled={awaitingVerification}
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
              disabled={awaitingVerification}
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
            disabled={awaitingVerification}
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
              disabled={awaitingVerification}
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

        {!awaitingVerification && (
          <button
            type="submit"
            className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting || !isLoaded}
          >
            {isSubmitting ? 'Creating your account…' : 'Create account'}
          </button>
        )}

        {awaitingVerification && (
          <div className="space-y-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-4">
            <p className="text-sm text-emerald-100">
              We sent a 6-digit code to {formValues.email}. Enter it below to verify your account.
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value)}
              className="w-full rounded-2xl border border-white/40 bg-white/10 px-4 py-3 text-base text-white placeholder:text-slate-300 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
              placeholder="Enter verification code"
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isVerifying || verificationCode.length < 6}
            >
              {isVerifying ? 'Verifying…' : 'Verify & continue'}
            </button>
          </div>
        )}

        <p className="text-center text-sm text-slate-300">
          Already have an account?{' '}
          <Link to="/signin" className="font-semibold text-orange-300 hover:text-orange-200">
            Sign in
          </Link>
        </p>
      </form>
    </SignUpLayout>
  );
}

function SignUpDisabledNotice() {
  return (
    <SignUpLayout>
      <div className="space-y-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5">
        <p className="text-sm text-amber-100">
          Clerk authentication is currently disabled. Add <code className="font-mono">VITE_CLERK_PUBLISHABLE_KEY</code> and{' '}
          <code className="font-mono">VITE_CLERK_FRONTEND_API</code> to your environment, restart the dev server, and refresh this page to use the real sign-up flow.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-amber-50/90">
          <li>Visit the Clerk dashboard to copy your keys.</li>
          <li>Update <code className="font-mono">.env.local</code> (or deployment env vars) with those values.</li>
          <li>Re-run <code className="font-mono">npm run dev</code> so Vite picks up the changes.</li>
        </ul>
      </div>
    </SignUpLayout>
  );
}

export default function SignUpPage() {
  return clerkEnabled ? <ClerkSignUpForm /> : <SignUpDisabledNotice />;
}
