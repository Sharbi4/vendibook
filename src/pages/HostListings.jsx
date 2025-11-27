import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ExternalLink, Pencil, RefreshCcw, Share2 } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import { buildListingPath, buildShareUrl, formatListingTypeLabel } from '../utils/listingRoutes';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

function HostListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedListingId, setCopiedListingId] = useState(null);

  const fetchListings = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/listings');
      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        throw new Error(errorResult.error || 'Failed to load listings');
      }

      const result = await response.json();
      const data = Array.isArray(result?.data) ? result.data : [];

      // TODO: Filter to the authenticated host once auth wiring is available.
      setListings(data);
      setStatus('success');
    } catch (error) {
      console.error('Failed to fetch host listings', error);
      setStatus('error');
      setErrorMessage(error.message || 'Unable to load listings');
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleShareClick = async (listing) => {
    const shareUrl = buildShareUrl(listing);
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedListingId(listing.id);
      setTimeout(() => setCopiedListingId(null), 2000);
    } catch (error) {
      console.warn('Clipboard write failed, opening share URL instead', error);
      window.open(shareUrl, '_blank');
    }
  };

  const isLoading = status === 'loading';
  const isError = status === 'error';
  const isEmpty = status === 'success' && listings.length === 0;

  const renderListingCard = (listing) => {
    const location = [listing.city, listing.state].filter(Boolean).join(', ') || 'Location not set';
    const price = typeof listing.price === 'number' && listing.price > 0
      ? currencyFormatter.format(listing.price)
      : 'Price TBD';

    return (
      <div
        key={listing.id}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-transparent transition hover:shadow-lg hover:ring-orange-100"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Listing</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">{listing.title || 'Untitled listing'}</h3>
            <p className="text-sm text-slate-600">{location}</p>
          </div>
          <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
            {formatListingTypeLabel(listing.listing_type || listing.listingType)}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">{price}</span>
          <span className="text-slate-400">•</span>
          <span>{listing.booking_mode || listing.bookingMode || 'Booking mode TBD'}</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate(buildListingPath(listing))}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-300"
          >
            <ExternalLink className="h-4 w-4" /> View
          </button>
          <button
            type="button"
            onClick={() => navigate(`/host/listings/${listing.id}/edit`)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-300"
          >
            <Pencil className="h-4 w-4" /> Edit
          </button>
          <button
            type="button"
            onClick={() => handleShareClick(listing)}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow"
          >
            <Share2 className="h-4 w-4" />
            {copiedListingId === listing.id ? 'Link copied' : 'Share'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <PageShell
      title="Manage listings"
      subtitle="Review, edit and share your Vendibook listings"
      action={{ label: 'Create new listing', onClick: () => navigate('/host/onboarding'), icon: ArrowRight }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Your listings</p>
          <p className="text-slate-600">Keep everything up to date and share links with partners.</p>
        </div>
        <button
          type="button"
          onClick={fetchListings}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-300"
        >
          <RefreshCcw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {isError && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      {isLoading && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse">
              <div className="h-4 w-1/2 rounded bg-slate-200" />
              <div className="mt-3 h-6 w-2/3 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-1/3 rounded bg-slate-200" />
              <div className="mt-8 h-10 rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">No listings yet</p>
          <h3 className="mt-3 text-2xl font-bold text-slate-900">Create your first listing</h3>
          <p className="mt-2 text-slate-600">Launch your first truck, trailer, or Event Pro profile in a few minutes.</p>
          <button
            type="button"
            onClick={() => navigate('/host/onboarding')}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg"
          >
            <ArrowRight className="h-4 w-4" /> Create your first listing
          </button>
        </div>
      )}

      {!isLoading && !isEmpty && !isError && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {listings.map(renderListingCard)}
        </div>
      )}
    </PageShell>
  );
}

export default HostListings;
