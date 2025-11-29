import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSignIn } from '@clerk/clerk-react';
import { Truck, CalendarDays, Coins } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { clerkPublishableKey } from '../config/clerkConfig';

const featureHighlights = [
  {
    icon: Truck,
    label: 'Rent food trucks for a weekend',
  },
  {
    icon: CalendarDays,
    label: 'Book Event Pros for launches',
  },
  {
    icon: Coins,
    label: 'Monetize your truck or trailer',
  },
];

const clerkEnabled = Boolean(clerkPublishableKey);

function SignInLayout({ children }) {
  return (
    <AuthLayout>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-200">
            Vendibook
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Sign in to Vendibook</h1>
          <p className="mt-2 text-base text-slate-100/80">
            Access your rentals, bookings, and vendor listings in one single dashboard.
          </p>
        </div>

        {children}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-orange-200">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-300" />
            <span>Inside Vendibook</span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {featureHighlights.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="rounded-xl bg-slate-900/60 px-3 py-4 text-sm text-slate-100/90"
              >
                <div className="mb-2 inline-flex items-center gap-2 text-orange-200">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-widest">
                    Feature
                  </span>
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

function ClerkSignInForm() {
  const [formValues, setFormValues] = useState({ email: '', password: '' });
  const [code, setCode] = useState('');
  const [showEmailCode, setShowEmailCode] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [formError, setFormError] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/host/dashboard';

  // ✅ useSignIn gives you setActive (do NOT use useAuth for this)
  const { isLoaded, signIn, setActive } = useSignIn();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));

    if (formError) setFormError('');
  };

  // Step 1: Email + password
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isLoaded) return;

    setIsSubmitting(true);
    setFormError('');

    try {
      const signInAttempt = await signIn.create({
        identifier: formValues.email,
        password: formValues.password,
      });

      if (signInAttempt.status === 'complete') {
        // No second factor needed – just sign them in
        await setActive({ session: signInAttempt.createdSessionId });
        navigate(redirectTo, { replace: true });
        return;
      }

      if (signInAttempt.status === 'needs_second_factor') {
        // Client Trust / MFA: need email code second factor
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (factor) => factor.strategy === 'email_code'
        );

        if (emailCodeFactor) {
          // Ask Clerk to send the email code
          await signIn.prepareSecondFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          });

          setShowEmailCode(true);
        } else {
          setFormError(
            'This account requires an additional verification method that is not supported by this form.'
          );
        }

        return;
      }

      // Any other status – surface a generic message but log details
      console.error('Unexpected sign-in status:', signInAttempt.status, signInAttempt);
      setFormError('We could not complete your sign-in. Please try again or contact support.');
    } catch (error) {
      console.error('Clerk signIn.create error:', error);
      const clerkError = error?.errors?.[0]?.message;
      setFormError(clerkError || 'We could not sign you in with those credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Email code (second factor)
  const handleCodeSubmit = async (event) => {
    event.preventDefault();
    if (!isLoaded) return;

    const trimmedCode = code.trim();
    if (trimmedCode.length < 6) {
      setFormError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setIsVerifying(true);
    setFormError('');

    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code: trimmedCode,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        navigate(redirectTo, { replace: true });
      } else {
        console.warn('Second factor not complete:', signInAttempt);
        setFormError(
          'We could not verify that code. Please check your email and try again, or request a new sign-in.'
        );
      }
    } catch (error) {
      console.error('Clerk signIn.attemptSecondFactor error:', error);
      const clerkError = error?.errors?.[0]?.message;
      setFormError(clerkError || 'That verification code did not work. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SignInLayout>
      {formError && (
        <p
          className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100"
          aria-live="assertive"
        >
          {formError}
        </p>
      )}

      <form
        className="space-y-6"
        onSubmit={showEmailCode ? handleCodeSubmit : handleSubmit}
        noValidate
      >
        {/* Step 1: email + password */}
        {!showEmailCode && (
          <>
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
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-orange-300 hover:text-orange-200"
                  >
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
              disabled={isSubmitting || !isLoaded}
            >
              {isSubmitting ? 'Signing you in…' : 'Sign in'}
            </button>
          </>
        )}

        {/* Step 2: email code second factor */}
        {showEmailCode && (
          <div className="space-y-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-4">
            <p className="text-sm text-emerald-100">
              We&apos;ve emailed a 6-digit verification code to{' '}
              <span className="font-semibold">{formValues.email}</span>. Enter it below to finish
              signing in.
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="w-full rounded-2xl border border-white/40 bg-white/10 px-4 py-3 text-base text-white placeholder:text-slate-300 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
              placeholder="Enter verification code"
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isVerifying || code.trim().length < 6 || !isLoaded}
            >
              {isVerifying ? 'Verifying…' : 'Verify & continue'}
            </button>
          </div>
        )}

        <p className="text-center text-sm text-slate-300">
          Do not have an account yet?{' '}
          <Link to="/signup" className="font-semibold text-orange-300 hover:text-orange-200">
            Sign up
          </Link>
        </p>
      </form>
    </SignInLayout>
  );
}

function SignInDisabledNotice() {
  return (
    <SignInLayout>
      <div className="space-y-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5">
        <p className="text-sm text-amber-100">
          Clerk authentication is currently disabled. To enable sign-in, add{' '}
          <code className="font-mono">VITE_CLERK_PUBLISHABLE_KEY</code> and{' '}
          <code className="font-mono">VITE_CLERK_FRONTEND_API</code> to your environment, restart{' '}
          <code className="font-mono">npm run dev</code>, and refresh this page.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-amber-50/90">
          <li>Get your keys from the Clerk dashboard.</li>
          <li>
            Update <code className="font-mono">.env.local</code> (or the deployment env) with the new
            values.
          </li>
          <li>Re-run the dev server so Vite picks up the changes.</li>
        </ul>
      </div>
    </SignInLayout>
  );
}

export default function SignInPage() {
  return clerkEnabled ? <ClerkSignInForm /> : <SignInDisabledNotice />;
}



// import { useState } from 'react';
// import { Link, useNavigate, useSearchParams } from 'react-router-dom';
// import { useSignIn, useAuth } from '@clerk/clerk-react';
// import { Truck, CalendarDays, Coins } from 'lucide-react';
// import AuthLayout from '../layouts/AuthLayout';
// import { clerkPublishableKey } from '../config/clerkConfig';

// const featureHighlights = [
//   {
//     icon: Truck,
//     label: 'Rent food trucks for a weekend'
//   },
//   {
//     icon: CalendarDays,
//     label: 'Book Event Pros for launches'
//   },
//   {
//     icon: Coins,
//     label: 'Monetize your truck or trailer'
//   }
// ];

// const clerkEnabled = Boolean(clerkPublishableKey);

// function SignInLayout({ children }) {
//   return (
//     <AuthLayout>
//       <div className="space-y-8">
//         <div>
//           <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-200">Vendibook</p>
//           <h1 className="mt-3 text-3xl font-semibold text-white">Sign in to Vendibook</h1>
//           <p className="mt-2 text-base text-slate-100/80">
//             Access your rentals, bookings, and vendor listings in one single dashboard.
//           </p>
//         </div>

//         {children}

//         <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
//           <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-orange-200">
//             <span className="h-1.5 w-1.5 rounded-full bg-orange-300" />
//             <span>Inside Vendibook</span>
//           </div>
//           <div className="mt-3 grid gap-3 sm:grid-cols-3">
//             {featureHighlights.map(({ icon: Icon, label }) => (
//               <div key={label} className="rounded-xl bg-slate-900/60 px-3 py-4 text-sm text-slate-100/90">
//                 <div className="mb-2 inline-flex items-center gap-2 text-orange-200">
//                   <Icon className="h-4 w-4" />
//                   <span className="text-xs font-semibold uppercase tracking-widest">Feature</span>
//                 </div>
//                 <p>{label}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </AuthLayout>
//   );
// }

// function ClerkSignInForm() {
//   const [formValues, setFormValues] = useState({ email: '', password: '' });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [formError, setFormError] = useState('');
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const redirectTo = searchParams.get('redirectTo') || '/dashboard';
//   const { isLoaded, signIn } = useSignIn();
//   const { setActive } = useAuth();

//   const handleChange = (event) => {
//     const { name, value } = event.target;
//     setFormValues((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     if (!isLoaded) return;
//     setIsSubmitting(true);
//     setFormError('');

//     try {
//       const result = await signIn.create({
//         identifier: formValues.email,
//         password: formValues.password
//       });

//       if (result.status === 'complete') {
//         await setActive({ session: result.createdSessionId });
//         navigate(redirectTo, { replace: true });
//       } else {
//         setFormError('Additional verification is required. Please continue in the verification flow.');
//       }
//     } catch (error) {
//       const clerkError = error?.errors?.[0]?.message;
//       setFormError(clerkError || 'We could not sign you in with those credentials.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <SignInLayout>
//       {formError && (
//         <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100" aria-live="assertive">
//           {formError}
//         </p>
//       )}

//       <form className="space-y-6" onSubmit={handleSubmit}>
//         <div className="space-y-4">
//           <div>
//             <label htmlFor="email" className="text-sm font-medium text-slate-100">
//               Email address
//             </label>
//             <input
//               id="email"
//               name="email"
//               type="email"
//               required
//               autoComplete="email"
//               className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
//               placeholder="you@vendibook.com"
//               value={formValues.email}
//               onChange={handleChange}
//             />
//           </div>

//           <div>
//             <div className="flex items-center justify-between">
//               <label htmlFor="password" className="text-sm font-medium text-slate-100">
//                 Password
//               </label>
//               <Link to="/forgot-password" className="text-sm font-medium text-orange-300 hover:text-orange-200">
//                 Forgot your password?
//               </Link>
//             </div>
//             <input
//               id="password"
//               name="password"
//               type="password"
//               required
//               className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
//               placeholder="Enter a secure password"
//               value={formValues.password}
//               onChange={handleChange}
//             />
//           </div>
//         </div>

//         <button
//           type="submit"
//           className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
//           disabled={isSubmitting || !isLoaded}
//         >
//           {isSubmitting ? 'Signing you in…' : 'Sign in'}
//         </button>

//         <p className="text-center text-sm text-slate-300">
//           Do not have an account yet?{' '}
//           <Link to="/signup" className="font-semibold text-orange-300 hover:text-orange-200">
//             Sign up
//           </Link>
//         </p>
//       </form>
//     </SignInLayout>
//   );
// }

// function SignInDisabledNotice() {
//   return (
//     <SignInLayout>
//       <div className="space-y-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5">
//         <p className="text-sm text-amber-100">
//           Clerk authentication is currently disabled. To enable sign-in, add <code className="font-mono">VITE_CLERK_PUBLISHABLE_KEY</code>{' '}
//           and <code className="font-mono">VITE_CLERK_FRONTEND_API</code> to your environment, restart <code className="font-mono">npm run dev</code>,
//           and refresh this page.
//         </p>
//         <ul className="list-disc space-y-1 pl-5 text-sm text-amber-50/90">
//           <li>Get your keys from the Clerk dashboard.</li>
//           <li>Update <code className="font-mono">.env.local</code> (or the deployment env) with the new values.</li>
//           <li>Re-run the dev server so Vite picks up the changes.</li>
//         </ul>
//       </div>
//     </SignInLayout>
//   );
// }

// export default function SignInPage() {
//   return clerkEnabled ? <ClerkSignInForm /> : <SignInDisabledNotice />;
// }
