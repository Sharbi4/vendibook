import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { MessageCircle, Lock, ArrowLeft, ShoppingBag, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AppHeader from '../components/AppHeader';

/**
 * MessagesInfoPage - Explains that booking is required before messaging
 * 
 * This page is shown when:
 * 1. User clicks "Message" but doesn't have a confirmed booking
 * 2. User is redirected after login with ?listingId param
 */
export default function MessagesInfoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const listingId = searchParams.get('listingId') || searchParams.get('listing_id');

  // Fetch listing details
  useEffect(() => {
    if (!listingId) {
      setLoading(false);
      return;
    }

    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${listingId}`);
        if (response.ok) {
          const data = await response.json();
          setListing(data);
        }
      } catch (error) {
        console.warn('Failed to fetch listing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  // Check if user can now message (after login/booking)
  useEffect(() => {
    if (!isAuthenticated || !listingId || !user?.id) {
      return;
    }

    const checkEligibility = async () => {
      setCheckingEligibility(true);
      try {
        const response = await fetch(
          `/api/messages/canStartThread?listingId=${listingId}&userId=${user.id}`
        );
        const data = await response.json();

        if (data.allowed && data.threadId) {
          // User can message - redirect to thread
          navigate(`/messages/${data.threadId}`);
        }
      } catch (error) {
        console.warn('Failed to check messaging eligibility:', error);
      } finally {
        setCheckingEligibility(false);
      }
    };

    checkEligibility();
  }, [isAuthenticated, listingId, user?.id, navigate]);

  const handleBookNow = () => {
    if (listingId) {
      navigate(`/listing/${listingId}`);
    } else {
      navigate('/listings');
    }
  };

  const handleReturnToListing = () => {
    if (listingId) {
      navigate(`/listing/${listingId}`);
    } else {
      navigate(-1);
    }
  };

  if (loading || checkingEligibility) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-orange-200 border-t-orange-500" />
            <p className="text-sm text-slate-500">
              {checkingEligibility ? 'Checking messaging access...' : 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={handleReturnToListing}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {listingId ? 'Back to listing' : 'Go back'}
        </button>

        {/* Main card */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-10 text-center text-white">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold">
              Private messaging is available after booking
            </h1>
          </div>

          {/* Content */}
          <div className="px-8 py-10">
            {listing && (
              <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Listing
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {listing.title || 'Untitled Listing'}
                </p>
                {(listing.city || listing.state) && (
                  <p className="text-sm text-slate-500">
                    {[listing.city, listing.state].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-6 text-slate-600">
              <p className="text-lg leading-relaxed">
                To protect hosts and keep communication focused on real bookings, 
                private messaging for this listing is only available after you 
                complete a booking.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                  <div>
                    <p className="font-medium text-slate-900">Spam protection</p>
                    <p className="text-sm text-slate-500">
                      Hosts receive fewer low-quality inquiries
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                  <div>
                    <p className="font-medium text-slate-900">Focused conversations</p>
                    <p className="text-sm text-slate-500">
                      Discuss your confirmed booking details directly
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShoppingBag className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500" />
                  <div>
                    <p className="font-medium text-slate-900">Serious inquiries only</p>
                    <p className="text-sm text-slate-500">
                      Booking first shows you&apos;re committed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-10 space-y-3">
              <button
                onClick={handleBookNow}
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition hover:shadow-xl"
              >
                Book this listing
              </button>
              <button
                onClick={handleReturnToListing}
                className="w-full rounded-xl border-2 border-slate-200 px-6 py-3 text-base font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Return to listing
              </button>
            </div>

            {!isAuthenticated && (
              <p className="mt-6 text-center text-sm text-slate-500">
                Already have a booking?{' '}
                <Link 
                  to={`/signin?redirect=/messages/info${listingId ? `?listingId=${listingId}` : ''}`}
                  className="font-semibold text-orange-500 hover:text-orange-600"
                >
                  Sign in
                </Link>{' '}
                to access your messages.
              </p>
            )}
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Have questions about a listing before booking?{' '}
            <Link to="/community" className="font-medium text-orange-500 hover:text-orange-600">
              Ask the community
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
