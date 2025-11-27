import { Star } from 'lucide-react';
import { getListingTypeInfo, formatPrice } from '../data/listings';

/**
 * ListingCardPreview Component
 *
 * Displays a preview of how a listing will look to customers.
 * Used in HostOnboardingWizard live preview panel.
 * Mirrors the design of ListingCard component.
 *
 * @param {Object} listingData - Partial listing object with title, price, etc.
 */
function ListingCardPreview({ listingData }) {
  if (!listingData.listingType) {
    return (
      <div className="rounded-3xl border border-charcoal/10 bg-white px-6 py-8 text-center text-charcoal/65">
        <p>Choose a listing type to see preview</p>
      </div>
    );
  }

  const typeInfo = getListingTypeInfo(listingData.listingType);

  return (
    <div className="rounded-3xl border border-charcoal/10 bg-white shadow-brand-soft">
      <div className="relative aspect-[20/19] overflow-hidden rounded-t-3xl bg-neutralLight">
        {listingData.imageUrl ? (
          <img
            src={listingData.imageUrl}
            alt="Preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-charcoal/20">
            📷
          </div>
        )}
        <div
          className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
          style={{
            background: typeInfo.bgColor,
            color: typeInfo.color
          }}
        >
          {typeInfo.label}
        </div>
      </div>

      <div className="space-y-3 px-6 py-5">
        <h4 className="text-base font-semibold text-charcoal">
          {listingData.title || 'Your listing title'}
        </h4>

        <p className="text-sm text-charcoal/65">
          {listingData.city && listingData.state
            ? `${listingData.city}, ${listingData.state}`
            : 'City, State'}
        </p>

        <div className="flex items-center gap-1 text-sm font-semibold text-orange">
          <Star className="h-4 w-4 fill-orange text-orange" />
          <span>New</span>
        </div>

        {listingData.amenities && listingData.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {listingData.amenities.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="rounded-full bg-neutralLight px-3 py-1 text-[11px] font-semibold text-charcoal/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="text-base font-semibold text-charcoal">
          {listingData.price && listingData.priceUnit
            ? formatPrice(parseInt(listingData.price, 10), listingData.priceUnit)
            : 'Set your price'}
        </p>
      </div>
    </div>
  );
}

export default ListingCardPreview;
