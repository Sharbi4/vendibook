import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ShieldAlert, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * IdentityVerificationGate
 *
 * Component that restricts access to features until the user completes
 * Stripe Identity verification.
 *
 * Props:
 * - children: Content to show when verified
 * - requireVerification: If true, show locked state when not verified
 */
export default function IdentityVerificationGate({ children, requireVerification = true }) {
  const { user, isLoaded } = useUser();
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingSession, setCreatingSession] = useState(false);

  // Fetch verification status
  useEffect(() => {
    async function fetchStatus() {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get session token
        const token = await user.getToken();

        // Fetch verification status from API
        const response = await fetch('/api/identity/status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch verification status');
        }

        const data = await response.json();
        setVerificationStatus(data);
      } catch (err) {
        console.error('Error fetching verification status:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, [user, isLoaded]);

  const handleStartVerification = async () => {
    if (!user) return;

    try {
      setCreatingSession(true);
      setError(null);

      // Get session token
      const token = await user.getToken();

      // Create verification session
      const response = await fetch('/api/identity/create-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create verification session');
      }

      const data = await response.json();

      // Redirect to Stripe Identity verification
      window.location.href = data.url;
    } catch (err) {
      console.error('Error starting verification:', err);
      setError(err.message);
      setCreatingSession(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error loading verification status</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // If verification is not required, show content
  if (!requireVerification) {
    return children;
  }

  // Check verification status
  const isVerified = verificationStatus?.identityVerified === true;
  const status = verificationStatus?.stripeVerificationStatus || 'none';

  // If verified, show content
  if (isVerified) {
    return children;
  }

  // Show locked state with CTA to verify
  return (
    <div className="space-y-6">
      {/* Verification Required Banner */}
      <div className="rounded-xl border-2 border-[#FF6B35] bg-gradient-to-br from-orange-50 to-white p-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-[#FF6B35] flex items-center justify-center">
              <Lock className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your Identity to Access Full Account
            </h2>
            <p className="text-gray-700 mb-6">
              To protect our community and comply with regulations, we require identity
              verification before you can create listings, receive payouts, or access
              certain features.
            </p>

            {status === 'pending' || status === 'processing' ? (
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">Verification in progress</p>
                  <p className="text-sm text-blue-700">
                    Your identity verification is being processed. This may take a few moments.
                  </p>
                </div>
              </div>
            ) : status === 'requires_input' ? (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">Verification needs attention</p>
                  <p className="text-sm text-amber-700">
                    We couldn&apos;t verify your identity. Please try again with a different
                    document or check that your information is clear and readable.
                  </p>
                </div>
              </div>
            ) : null}

            <button
              onClick={handleStartVerification}
              disabled={creatingSession || status === 'processing'}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-[#FF6B35] hover:bg-[#FF8C42] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingSession ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Starting Verification...
                </>
              ) : status === 'requires_input' ? (
                <>
                  <ShieldAlert className="w-5 h-5" />
                  Retry Verification
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Verify to Access Full Account
                </>
              )}
            </button>

            <p className="text-sm text-gray-600 mt-4">
              Verification typically takes less than 2 minutes. You&apos;ll need:
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4">
              <li>• A valid government-issued ID (driver&apos;s license, passport, etc.)</li>
              <li>• A smartphone or webcam for a quick selfie</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Locked Features List */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4">
          🔒 Features Locked Until Verification
        </h3>
        <div className="grid gap-3">
          <LockedFeatureItem icon={<Lock className="w-4 h-4" />} text="Create and manage listings" />
          <LockedFeatureItem icon={<Lock className="w-4 h-4" />} text="Host dashboard and analytics" />
          <LockedFeatureItem icon={<Lock className="w-4 h-4" />} text="Receive payouts" />
          <LockedFeatureItem icon={<Lock className="w-4 h-4" />} text="Message other users" />
          <LockedFeatureItem icon={<Lock className="w-4 h-4" />} text="Book high-value rentals" />
          <LockedFeatureItem icon={<Lock className="w-4 h-4" />} text="Sell equipment" />
        </div>
      </div>
    </div>
  );
}

function LockedFeatureItem({ icon, text }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="text-gray-400">{icon}</div>
      <span className="text-gray-600">{text}</span>
    </div>
  );
}

LockedFeatureItem.propTypes = {
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired
};

IdentityVerificationGate.propTypes = {
  children: PropTypes.node.isRequired,
  requireVerification: PropTypes.bool
};
