import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

/**
 * Checkout Cancel Page
 * 
 * Displayed when user cancels the Stripe checkout.
 */
function CheckoutCancel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get('listing_id');

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Cancel card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Checkout Cancelled
            </h1>
            <p className="text-white/90">
              Your payment was not processed
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            <p className="text-center text-slate-600">
              No worries! Your dates are still available and you can complete
              your booking anytime.
            </p>

            {/* Common reasons */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Need help?</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>Questions about the listing? Message the host</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>Payment issues? Try a different payment method</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>Need flexible dates? Check the calendar again</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 space-y-3">
            {listingId ? (
              <button
                onClick={() => navigate(`/listing/${listingId}`)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
            ) : (
              <button
                onClick={() => navigate('/listings')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition"
              >
                Browse Listings
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutCancel;
