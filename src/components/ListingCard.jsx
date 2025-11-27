import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function ListingCard({ listing }) {
  const [imageError, setImageError] = useState(false);
  
  const listingId = listing?.id;
  const title = listing?.title || 'Untitled listing';
  const city = listing?.city || listing?.city_name || '';
  const state = listing?.state || listing?.state_code || '';
  const location = [city, state].filter(Boolean).join(', ') || 'Location coming soon';
  const price = listing?.price ?? listing?.price_per_day;
  const priceUnit = listing?.price_unit || listing?.priceUnit || 'day';
  const imageUrl = listing?.image_url || listing?.imageUrl || listing?.image;
  const deliveryAvailable = Boolean(listing?.delivery_available ?? listing?.deliveryAvailable);
  const rating = listing?.rating || 'New';
  const reviews = listing?.reviews || listing?.review_count || 0;
  const host = listing?.host_name || listing?.hostName || listing?.host || '';
  const tagSource = listing?.features || listing?.tags || listing?.amenities || [];
  const tags = Array.isArray(tagSource) ? tagSource.slice(0, 3) : [];

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link
      to={listingId ? `/listing/${listingId}` : '#'}
      className="group block text-charcoal no-underline"
    >
      <div className="flex flex-col">
        <div className="relative mb-3 aspect-[20/19] overflow-hidden rounded-3xl bg-neutralLight">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={title}
              onError={handleImageError}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-orange/10 text-4xl">
              🚚
            </div>
          )}
          {deliveryAvailable && (
            <div className="absolute right-3 top-3 rounded-full bg-charcoal/85 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              Delivery
            </div>
          )}
        </div>

        <div>
          <div className="mb-1 flex items-start justify-between gap-3">
            <h3 className="flex-1 text-sm font-semibold text-charcoal">
              {title}
            </h3>
            <div className="flex items-center gap-1 text-xs font-semibold text-orange">
              <span>★</span>
              <span>{rating}</span>
              {reviews > 0 && <span className="text-charcoal/55">({reviews})</span>}
            </div>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/55">{location}</p>
          {host && (
            <p className="text-xs text-charcoal/55">{host}</p>
          )}

          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((feature, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-neutralLight px-3 py-1 text-[11px] font-semibold text-charcoal/70"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}

          <p className="mt-4 text-base text-charcoal">
            <span className="font-semibold">
              {price ? `$${typeof price === 'number' ? price.toLocaleString() : price}` : 'Price available upon request'}
            </span>
            {price && (
              <span className="text-charcoal/60"> / {priceUnit}</span>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}
