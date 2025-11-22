import { Link } from 'react-router-dom';

const formatCurrency = (value) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return '—';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value));
};

const humanizeType = (type) => {
  if (!type) return 'Marketplace Listing';
  return type
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const truncate = (text = '', length = 160) => {
  if (!text) return '';
  return text.length > length ? `${text.slice(0, length - 3)}...` : text;
};

export default function ListingCard({ listing }) {
  const listingId = listing?.id;
  const location = [listing?.city, listing?.state].filter(Boolean).join(', ');
  const priceDisplay = formatCurrency(listing?.price);
  const priceUnit = listing?.price_unit || listing?.priceUnit || 'per day';
  const typeLabel = humanizeType(listing?.listing_type || listing?.listingType);
  const description = truncate(listing?.description);
  const deliveryAvailable = Boolean(listing?.delivery_available ?? listing?.deliveryAvailable);
  const updatedAtRaw = listing?.updated_at || listing?.updatedAt;
  const updatedAtDate = updatedAtRaw ? new Date(updatedAtRaw) : null;
  const lastUpdatedLabel = updatedAtDate && !Number.isNaN(updatedAtDate.getTime())
    ? updatedAtDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'recently';

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl focus-within:ring-2 focus-within:ring-orange-500"
      tabIndex={-1}
    >
      <div className="relative h-40 w-full bg-gradient-to-br from-orange-100 via-white to-orange-200">
        <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-600 shadow-sm">
          {typeLabel}
        </span>
        {deliveryAvailable && (
          <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            Delivery Available
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{listing?.title || 'Untitled listing'}</h3>
            <p className="mt-1 text-sm text-gray-600">{location || 'City & state coming soon'}</p>
          </div>
          {priceDisplay !== '—' && (
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-gray-400">Starting at</p>
              <p className="text-lg font-bold text-orange-500">{priceDisplay}</p>
              <p className="text-xs text-gray-500">{priceUnit}</p>
            </div>
          )}
        </div>

        {description && (
          <p className="text-sm leading-relaxed text-gray-600">{description}</p>
        )}

        <div className="mt-auto flex items-center justify-between text-xs font-medium uppercase tracking-wide text-gray-500">
          <span>{typeLabel}</span>
          <span>Updated {lastUpdatedLabel}</span>
        </div>
      </div>

      <div className="border-t border-gray-100 px-6 py-4">
        <Link
          to={listingId ? `/listing/${listingId}` : '#'}
          className={`inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
            listingId
              ? 'bg-orange-500 hover:bg-orange-600'
              : 'cursor-not-allowed bg-gray-300'
          }`}
          aria-disabled={!listingId}
          aria-label={listingId ? `View details for ${listing?.title}` : 'Listing details coming soon'}
        >
          View details
        </Link>
      </div>
    </article>
  );
}
