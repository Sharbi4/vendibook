import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Plus, Eye, Pause, Play } from 'lucide-react';
import { getListingTypeInfo, formatPrice } from '../data/listings';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';

function HostDashboard() {
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // FRONTEND ONLY: Load from localStorage. Will be replaced with API call in backend integration phase.
    try {
      const listings = JSON.parse(localStorage.getItem('vendibook_myListings') || '[]');
      setMyListings(listings);
    } catch (err) {
      setError('Failed to load listings');
      console.error('Failed to load host listings:', err);
    }
  }, []);

  const toggleStatus = (listingId) => {
    const updatedListings = myListings.map(l => {
      if (l.id === listingId) {
        return { ...l, status: l.status === 'live' ? 'paused' : 'live' };
      }
      return l;
    });
    setMyListings(updatedListings);
    localStorage.setItem('vendibook_myListings', JSON.stringify(updatedListings));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-orange-500">
                vendibook
              </span>
            </div>
            <button
              onClick={() => navigate('/host/onboarding')}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition"
            >
              <Plus className="w-4 h-4" />
              Create New Listing
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader 
          title="Your Listings" 
          subtitle="Manage and monitor your listings"
        />

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 p-8 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        ) : myListings.length === 0 ? (
          <EmptyState
            title="No listings yet"
            description="Create your first listing to start earning"
            action={{
              label: 'Create Your First Listing',
              onClick: () => navigate('/host/onboarding')
            }}
          />
        ) : (
          <div className="space-y-4">
            {myListings.map(listing => {
              const typeInfo = getListingTypeInfo(listing.listingType);
              const status = listing.status || 'live';
              const isLive = status === 'live';

              return (
                <div
                  key={listing.id}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white border border-gray-200 rounded-lg items-start hover:shadow-md transition"
                >
                  {/* Image */}
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold ${typeInfo.bgColor} ${typeInfo.color}`}>
                      {typeInfo.label}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {listing.city}, {listing.state}
                    </p>
                    <p className="text-xl font-semibold text-gray-900">
                      {formatPrice(listing.price, listing.priceUnit)}
                    </p>
                    <div className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      isLive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {isLive ? '● Live' : '○ Paused'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => navigate(`/listing/${listing.id}`)}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => toggleStatus(listing.id)}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition font-medium text-sm"
                    >
                      {isLive ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Activate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default HostDashboard;
