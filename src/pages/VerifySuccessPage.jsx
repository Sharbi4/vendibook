import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Loader2, XCircle } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import AppLayout from '../layouts/AppLayout';

export default function VerifySuccessPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [status, setStatus] = useState('checking'); // checking, verified, failed, error
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    async function checkVerificationStatus() {
      if (!user) {
        setStatus('error');
        setMessage('Please sign in to continue.');
        return;
      }

      try {
        // Get session token
        const token = await user.getToken();

        // Check verification status
        const response = await fetch('/api/identity/status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to check verification status');
        }

        const data = await response.json();

        if (data.identityVerified) {
          setStatus('verified');
          setMessage('Your identity has been successfully verified!');

          // Reload user to get updated metadata
          await user.reload();
        } else if (data.stripeVerificationStatus === 'processing') {
          setStatus('processing');
          setMessage('Your verification is being processed. This may take a few moments.');
        } else if (data.stripeVerificationStatus === 'requires_input') {
          setStatus('failed');
          setMessage('We couldn\'t verify your identity. Please try again.');
        } else {
          setStatus('pending');
          setMessage('Your verification is pending. Please check back shortly.');
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
        setStatus('error');
        setMessage('An error occurred while checking your verification status.');
      }
    }

    checkVerificationStatus();
  }, [user]);

  // Countdown timer for auto-redirect
  useEffect(() => {
    if (status === 'verified' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (status === 'verified' && countdown === 0) {
      navigate('/dashboard');
    }
  }, [status, countdown, navigate]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  const handleRetry = () => {
    navigate('/dashboard');
  };

  return (
    <AppLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Checking status */}
          {status === 'checking' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Checking verification status...
              </h1>
              <p className="text-gray-600">
                Please wait while we confirm your identity verification.
              </p>
            </div>
          )}

          {/* Verified - Success */}
          {status === 'verified' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Identity Verified! 🎉
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                {message}
              </p>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
                <h2 className="font-bold text-lg text-gray-900 mb-3">
                  Your account is now fully unlocked
                </h2>
                <ul className="text-left space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Create and manage listings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Access host dashboard and analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Receive payouts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Message other users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Book high-value rentals and sell equipment</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleContinue}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-white bg-[#FF6B35] hover:bg-[#FF8C42] transition text-lg"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-sm text-gray-500 mt-4">
                Redirecting automatically in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p>
            </div>
          )}

          {/* Processing */}
          {status === 'processing' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Verification in Progress
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                {message}
              </p>
              <button
                onClick={handleContinue}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-white bg-[#FF6B35] hover:bg-[#FF8C42] transition"
              >
                Return to Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Failed */}
          {status === 'failed' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-6">
                <XCircle className="w-10 h-10 text-amber-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Verification Needs Attention
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                {message}
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8 text-left">
                <h2 className="font-bold text-lg text-gray-900 mb-3">
                  Tips for successful verification:
                </h2>
                <ul className="space-y-2 text-gray-700">
                  <li>• Use a clear, well-lit photo of your ID</li>
                  <li>• Ensure all text on your ID is readable</li>
                  <li>• Remove any cases or covers from your ID</li>
                  <li>• Take your selfie in good lighting</li>
                  <li>• Remove glasses or anything covering your face</li>
                </ul>
              </div>

              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-white bg-[#FF6B35] hover:bg-[#FF8C42] transition"
              >
                Return to Dashboard to Retry
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Something Went Wrong
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                {message}
              </p>
              <button
                onClick={handleContinue}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-white bg-[#FF6B35] hover:bg-[#FF8C42] transition"
              >
                Return to Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
