import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, CreditCard, ArrowRight, Loader2, MapPin } from 'lucide-react';

/**
 * Checkout Success Page
 * 
 * Displayed after successful Stripe payment.
 * Fetches session details and shows booking confirmation.
 */
function CheckoutSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [isLoading, setIsLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    // Fetch session details from our API
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/stripe/session?session_id=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setBookingDetails(data);
        }
      } catch (err) {
        console.warn('Could not fetch session details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to let webhook process
    setTimeout(fetchSession, 1000);
  }, [sessionId]);

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Success card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-white/90">
              Your payment was successful
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Booking details */}
            {bookingDetails?.metadata && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Dates</p>
                    <p className="font-semibold text-slate-900">
                      {formatDate(bookingDetails.metadata.startDate)}
                      {bookingDetails.metadata.endDate && bookingDetails.metadata.endDate !== bookingDetails.metadata.startDate && (
                        <> to {formatDate(bookingDetails.metadata.endDate)}</>
                      )}
                    </p>
                    {bookingDetails.metadata.rentalDays && (
                      <p className="text-sm text-slate-500">
                        {bookingDetails.metadata.rentalDays} day{bookingDetails.metadata.rentalDays !== '1' ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Total Paid</p>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(bookingDetails.metadata.totalAmount || (bookingDetails.amount_total / 100))}
                    </p>
                  </div>
                </div>

                {bookingDetails.metadata.listingTitle && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Listing</p>
                      <p className="font-semibold text-slate-900">
                        {bookingDetails.metadata.listingTitle}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* What's next */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-900 mb-3">What happens next?</h3>
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>The host will review your booking request</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>You'll receive a confirmation email once approved</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Full address and pickup instructions will be shared</span>
                </li>
              </ol>
            </div>

            {/* Confirmation email notice */}
            <p className="text-center text-sm text-slate-500">
              A confirmation email has been sent to your email address
            </p>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 space-y-3">
            <button
              onClick={() => navigate('/bookings')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition"
            >
              View My Bookings
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/listings')}
              className="w-full px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition"
            >
              Browse More Listings
            </button>
          </div>
        </div>

        {/* Session ID for reference */}
        {sessionId && (
          <p className="text-center text-xs text-slate-400 mt-6">
            Reference: {sessionId.slice(0, 20)}...
          </p>
        )}
      </div>
    </div>
  );
}

export default CheckoutSuccess;
