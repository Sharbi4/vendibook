import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pause, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { getListingTypeInfo, formatPrice } from '../data/listings';
import EmptyState from '../components/EmptyState';
import PageShell from '../components/layout/PageShell';
import MetricCard from '../components/MetricCard';
import { useAppStatus } from '../hooks/useAppStatus';
import IdentityVerificationGate from '../components/IdentityVerificationGate';

function HostDashboard() {
  const navigate = useNavigate();
  const { setGlobalLoading, setGlobalError } = useAppStatus();
  const [myListings, setMyListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });

  const fetchHostListings = useCallback(async () => {
    try {
      setIsLoading(true);
      setGlobalLoading(true);
      setError(null);
      setGlobalError(null);

      // FRONTEND ONLY: Load from localStorage. Will be replaced with real API call in backend integration phase.
      // Simulating paginated API response structure
      const allListings = JSON.parse(localStorage.getItem('vendibook_myListings') || '[]');
      const total = allListings.length;
      const pages = Math.ceil(total / limit) || 1;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const pageListings = allListings.slice(startIndex, endIndex);

      setMyListings(pageListings);
      setPagination({ page, limit, total, pages });
    } catch (err) {
      const errorMsg = 'Failed to load listings';
      setError(errorMsg);
      setGlobalError(errorMsg);
      console.error('Failed to load host listings:', err);
    } finally {
      setIsLoading(false);
      setGlobalLoading(false);
    }
  }, [page, limit, setGlobalLoading, setGlobalError]);

  useEffect(() => {
    fetchHostListings();
  }, [fetchHostListings]);

  const toggleStatus = (listingId) => {
    // Update localStorage and refetch to keep pagination consistent
    const allListings = JSON.parse(localStorage.getItem('vendibook_myListings') || '[]');
    const updatedListings = allListings.map(l => {
      if (l.id === listingId) {
        return { ...l, status: l.status === 'live' ? 'paused' : 'live' };
      }
      return l;
    });
    localStorage.setItem('vendibook_myListings', JSON.stringify(updatedListings));
    fetchHostListings();
  };

  const metrics = useMemo(() => {
    // Metrics based on ALL listings, not just current page
    const allListings = JSON.parse(localStorage.getItem('vendibook_myListings') || '[]');
    const live = allListings.filter(l => (l.status || 'live') === 'live').length;
    const paused = allListings.filter(l => (l.status || 'live') === 'paused').length;
    return { live, paused, total: allListings.length };
  }, []); // Computed from localStorage directly, not from state

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < pagination.pages) {
      setPage(page + 1);
    }
  };

  return (
    <PageShell
      title="Host Dashboard"
      subtitle="Manage your listings and monitor performance"
      action={{ label: 'Create Listing', onClick: () => navigate('/host/onboarding'), icon: Plus }}
    >
      <IdentityVerificationGate requireVerification={true}>
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
          <>
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

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-6">
                <div className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages} • {pagination.total} total listings
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={page === pagination.pages}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        </section>
      </IdentityVerificationGate>
    </PageShell>
  );
}

export default HostDashboard;
