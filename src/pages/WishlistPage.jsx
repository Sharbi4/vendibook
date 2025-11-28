import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ListingCard from '../components/ListingCard';

/**
 * Wishlist Page - Displays user's saved listings
 */
export default function WishlistPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [savedListings, setSavedListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin?redirect=/wishlist');
      return;
    }

    const fetchWishlist = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const userId = user?.id || user?._id || user?.userId;
        const response = await fetch(`/api/wishlist?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load wishlist');
        }

        const data = await response.json();
        setSavedListings(data.items || []);
      } catch (err) {
        console.error('Failed to fetch wishlist:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4 sm:px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500 fill-current" />
            <h1 className="text-3xl font-bold text-slate-900">Saved Listings</h1>
          </div>
          <p className="mt-2 text-slate-600">
            Listings you've saved for later
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-orange-500" />
              <p className="mt-4 text-slate-600">Loading your saved listings...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : savedListings.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <Heart className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-slate-900">
              No saved listings yet
            </h2>
            <p className="mt-2 text-slate-600">
              Start exploring and save listings you love by clicking the heart icon.
            </p>
            <button
              onClick={() => navigate('/listings')}
              className="mt-8 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
            >
              Browse Listings
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {savedListings.map((item) => (
              <ListingCard 
                key={item.listing_id || item.listingId || item.id} 
                listing={item.listing || item} 
              />
            ))}
          </div>
        )}

        {/* Stats */}
        {!isLoading && savedListings.length > 0 && (
          <div className="mt-8 rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{savedListings.length}</span>
              {' '}saved listing{savedListings.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
