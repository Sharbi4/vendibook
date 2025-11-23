import { useState } from 'react';
import PropTypes from 'prop-types';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

export default function VerificationRequired({ title, description, ctaLabel = 'Resend verification email' }) {
  const { sendVerification, isSendingVerification } = useAuth();
  const [status, setStatus] = useState(null);

  const handleResend = async () => {
    setStatus(null);
    try {
      await sendVerification();
      setStatus({ type: 'success', message: 'Verification email sent. Please check your inbox.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to send verification email.' });
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-orange-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-4 text-base text-slate-600">{description}</p>
      <button
        type="button"
        onClick={handleResend}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSendingVerification}
      >
        {isSendingVerification ? 'Sending…' : ctaLabel}
      </button>
      {status && (
        <p className={`mt-3 text-sm ${status.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
          {status.message}
        </p>
      )}
    </div>
  );
}

VerificationRequired.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  ctaLabel: PropTypes.string,
};
