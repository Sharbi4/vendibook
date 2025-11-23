import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

export default function VerificationBanner() {
  const location = useLocation();
  const { isAuthenticated, needsVerification, sendVerification, isSendingVerification } = useAuth();
  const [status, setStatus] = useState(null);

  if (!isAuthenticated || !needsVerification || location.pathname === '/verify-email') {
    return null;
  }

  const handleResend = async () => {
    setStatus(null);
    try {
      await sendVerification();
      setStatus({ type: 'success', message: 'Verification email sent.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to send email.' });
    }
  };

  return (
    <div className="border-b border-orange-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 text-sm text-slate-700 md:flex-row md:items-center md:justify-between">
        <span className="flex items-center gap-2 font-medium text-slate-900">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Verify your email to unlock booking and hosting on Vendibook.
        </span>
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
          {status && (
            <span className={`text-xs font-medium ${status.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
              {status.message}
            </span>
          )}
          <button
            type="button"
            onClick={handleResend}
            className="inline-flex items-center justify-center rounded-full border border-orange-200 px-4 py-1.5 text-xs font-semibold text-orange-600 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSendingVerification}
          >
            {isSendingVerification ? 'Sending…' : 'Resend verification email'}
          </button>
        </div>
      </div>
    </div>
  );
}
