import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Truck } from 'lucide-react';

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

const TYPE_THEMES = {
  RENT: {
    label: 'For Rent',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-600',
    accent: 'text-orange-500',
  },
  SALE: {
    label: 'For Sale',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-600',
    accent: 'text-amber-500',
  },
  EVENT_PRO: {
    label: 'Event Pro',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-600',
    accent: 'text-purple-500',
  },
};

const resolveTypeKey = (rawType = '') => {
  const normalized = rawType.toString().toUpperCase();
  if (normalized.includes('SALE')) return 'SALE';
  if (normalized.includes('EVENT')) return 'EVENT_PRO';
  return 'RENT';
};

const humanizeType = (type) => {
  if (!type) return 'Marketplace Listing';
  return type
    .toString()
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function ListingCard({ listing }) {
  const listingId = listing?.id;
  const title = listing?.title || 'Untitled listing';
  const location = [listing?.city || listing?.city_name, listing?.state || listing?.state_code]
    .filter(Boolean)
    .join(', ');
  const priceDisplay = formatCurrency(listing?.price ?? listing?.price_per_day);
  const priceUnit = listing?.price_unit || listing?.priceUnit || 'per day';
  const rawType = listing?.listing_type || listing?.listingType;
  const typeLabel = humanizeType(rawType);
  const typeKey = resolveTypeKey(rawType);
  const typeTheme = TYPE_THEMES[typeKey];
  const description = listing?.description || 'Details coming soon. Reach out to learn more about this asset.';
  const deliveryAvailable = Boolean(listing?.delivery_available ?? listing?.deliveryAvailable);
  const isVerified = Boolean(listing?.is_verified ?? listing?.isVerified);
  const updatedAtRaw = listing?.updated_at || listing?.updatedAt;
  const updatedAtDate = updatedAtRaw ? new Date(updatedAtRaw) : null;
  const lastUpdatedLabel = updatedAtDate && !Number.isNaN(updatedAtDate.getTime())
    ? updatedAtDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'recently';
  const descriptionClampStyles = {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };
  const tagSource = listing?.features || listing?.tags || listing?.amenities || [];
  const tags = Array.isArray(tagSource) ? tagSource.slice(0, 3) : [];

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl focus-within:ring-2 focus-within:ring-orange-200"
      tabIndex={-1}
    >
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-orange-100 via-white to-orange-200">
        <span
          className={`absolute left-5 top-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide shadow-sm ${typeTheme?.badgeBg || 'bg-white/90'} ${typeTheme?.badgeText || 'text-orange-600'}`}
        >
          <Truck className="h-4 w-4" />
          {typeLabel}
        </span>

        <div className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-1 text-xs font-semibold text-gray-700 shadow-sm">
          Updated {lastUpdatedLabel}
        </div>

        <div className="absolute right-5 top-5 flex gap-2">
          {isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-600 shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified
            </span>
          )}
          {deliveryAvailable && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-green-600 shadow-sm">
              Delivery
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 inline-flex items-center text-sm text-gray-600">
              <MapPin className="mr-1 h-4 w-4 text-gray-400" />
              {location || 'City & state coming soon'}
            </p>
          </div>
          {priceDisplay !== '—' && (
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-gray-400">Starting at</p>
              <p className={`text-xl font-bold ${typeTheme?.accent || 'text-orange-500'}`}>{priceDisplay}</p>
              <p className="text-xs text-gray-500">{priceUnit}</p>
            </div>
          )}
        </div>

        {description && (
          <p className="text-sm leading-relaxed text-gray-600" style={descriptionClampStyles}>
            {description}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between text-xs font-medium uppercase tracking-wide text-gray-500">
          <span>{typeTheme?.label || typeLabel}</span>
          <span>{listing?.city ? listing.city.toUpperCase() : 'NEW'}</span>
        </div>
      </div>

      <div className="border-t border-gray-100 px-6 py-4">
        <Link
          to={listingId ? `/listing/${listingId}` : '#'}
          className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
            listingId
              ? 'bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 hover:brightness-110'
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
