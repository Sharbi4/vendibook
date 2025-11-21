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
  return type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const truncate = (text = '', length = 140) => {
  if (!text) return '';
  return text.length > length ? `${text.slice(0, length - 3)}...` : text;
};

export default function ListingCard({ listing }) {
  const listingId = listing?.id;
  const location = [listing?.city, listing?.state].filter(Boolean).join(', ');
  const priceDisplay = formatCurrency(listing?.price);
  const typeLabel = humanizeType(listing?.listing_type || listing?.listingType);
  const description = truncate(listing?.description);

  return (
    <article
      className="flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-orange-500"
      tabIndex={-1}
    >
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{typeLabel}</p>
            <h3 className="mt-2 text-lg font-semibold text-gray-900">{listing?.title || 'Untitled listing'}</h3>
          </div>
          {priceDisplay !== '—' && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Starting at</p>
              <p className="text-lg font-bold text-orange-500">{priceDisplay}</p>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600">{location || 'City & State coming soon'}</div>

        {description && (
          <p className="text-sm leading-relaxed text-gray-600">{description}</p>
        )}
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
        >
          View details
        </Link>
      </div>
    </article>
  );
}
