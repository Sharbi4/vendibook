import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { refreshUser, sendVerification, isSendingVerification, user } = useAuth();
  const [status, setStatus] = useState(token ? 'loading' : 'error');
  const [message, setMessage] = useState(
    token ? 'Verifying your email…' : 'Verification link is invalid or missing.'
  );
  const [isVerifying, setIsVerifying] = useState(Boolean(token));
  const [resendStatus, setResendStatus] = useState(null);

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      setIsVerifying(true);
      try {
        const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success === false) {
          throw new Error(data.message || 'Verification link is invalid or expired.');
        }
        setStatus('success');
        setMessage('Your email has been verified.');
        await refreshUser();
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'Verification link is invalid or expired.');
      } finally {
        setIsVerifying(false);
      }
    };

    verify();
  }, [token, refreshUser]);

  const handleResend = async () => {
    setResendStatus(null);
    if (!user?.email) {
      setResendStatus({ type: 'error', message: 'Log in to resend the verification email.' });
      return;
    }
    try {
      await sendVerification();
      setResendStatus({ type: 'success', message: 'Verification email sent. Check your inbox.' });
    } catch (error) {
      setResendStatus({ type: 'error', message: error.message || 'Unable to send verification email.' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-orange-500">
          {status === 'success' ? (
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          ) : (
            <AlertTriangle className="h-10 w-10 text-orange-500" />
          )}
        </div>
        <h1 className="text-3xl font-semibold text-slate-900">
          {status === 'success' ? 'Your email has been verified' : 'Verify your email'}
        </h1>
        <p className="mt-4 text-base text-slate-600">{message}</p>

        {status === 'success' ? (
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600"
          >
            Continue to dashboard
          </button>
        ) : (
          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={handleResend}
              className="inline-flex w-full items-center justify-center rounded-full border border-orange-200 bg-white px-6 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSendingVerification || isVerifying}
            >
              {isSendingVerification ? 'Sending…' : 'Resend verification email'}
            </button>
            {resendStatus && (
              <p className={`text-sm ${resendStatus.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                {resendStatus.message}
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-6 text-sm font-medium text-slate-500 underline-offset-4 hover:underline"
        >
          Return home
        </button>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
