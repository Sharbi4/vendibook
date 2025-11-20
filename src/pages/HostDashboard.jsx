import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Plus, Eye, Pause, Play } from 'lucide-react';
import { getListingTypeInfo, formatPrice } from '../data/listings';
import EmptyState from '../components/EmptyState';
import PageShell from '../components/layout/PageShell';
import MetricCard from '../components/MetricCard';

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

  const metrics = useMemo(() => {
    const live = myListings.filter(l => (l.status || 'live') === 'live').length;
    const paused = myListings.filter(l => (l.status || 'live') === 'paused').length;
    return { live, paused, total: myListings.length };
  }, [myListings]);

  return (
    <PageShell
      title="Host Dashboard"
      subtitle="Manage your listings and monitor performance"
      action={{ label: 'Create Listing', onClick: () => navigate('/host/onboarding'), icon: Plus }}
    >
      <section className="space-y-10">
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total Listings" value={metrics.total} />
          <MetricCard label="Live" value={metrics.live} tone="success" />
            <MetricCard label="Paused" value={metrics.paused} tone="warning" />
          <MetricCard label="Draft / Future" value={0} tone="info" />
        </div>

        {/* Listings */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading listings">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 p-8 text-center" role="alert">
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {myListings.map(listing => {
              const typeInfo = getListingTypeInfo(listing.listingType);
              const status = listing.status || 'live';
              const isLive = status === 'live';
              return (
                <div
                  key={listing.id}
                  className="group bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-4 hover:shadow-md transition"
                >
                  <div className="relative rounded-lg overflow-hidden h-40">
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold ${typeInfo.bgColor} ${typeInfo.color}`}>
                      {typeInfo.label}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">{listing.city}, {listing.state}</p>
                    <p className="text-xl font-semibold text-gray-900">{formatPrice(listing.price, listing.priceUnit)}</p>
                    <span className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isLive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>                      {isLive ? '● Live' : '○ Paused'}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => navigate(`/listing/${listing.id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
                      aria-label={`View listing ${listing.title}`}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => toggleStatus(listing.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
                      aria-label={`${isLive ? 'Pause' : 'Activate'} listing ${listing.title}`}
                    >
                      {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isLive ? 'Pause' : 'Activate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </PageShell>
  );
}

export default HostDashboard;
