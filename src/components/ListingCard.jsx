import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { MapPin, Users, Truck, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { SaveButtonOverlay } from './SaveButton';

/**
 * Premium ListingCard - Webflow Rental Template Style
 * Clean white cards with rounded corners, hero image, amenity badges, and CTA
 */
export default function ListingCard({ 
  listing, 
  showSaveButton = true,
  variant = 'default', // 'default' | 'featured' | 'compact'
  showBookButton = true
}) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const listingId = listing?.id;
  const title = listing?.title || 'Untitled listing';
  const city = listing?.city || listing?.city_name || '';
  const state = listing?.state || listing?.state_code || '';
  const location = [city, state].filter(Boolean).join(', ') || 'Location TBD';
  const price = listing?.price ?? listing?.price_per_day;
  const priceUnit = listing?.price_unit || listing?.priceUnit || 'day';
  const imageUrl = listing?.image_url || listing?.imageUrl || listing?.image;
  const deliveryAvailable = Boolean(listing?.delivery_available ?? listing?.deliveryAvailable);
  const rating = listing?.rating;
  const reviews = listing?.reviews || listing?.review_count || 0;
  const description = listing?.description || '';
  const capacity = listing?.capacity || listing?.capacityServed;
  const bedrooms = listing?.bedrooms || listing?.specs?.bedrooms;
  
  // Extract amenities/features for badges
  const tagSource = listing?.features || listing?.tags || listing?.amenities || listing?.highlights || [];
  const tags = Array.isArray(tagSource) ? tagSource.slice(0, 3) : [];

  const handleImageError = () => {
    setImageError(true);
  };

  // Determine if this is a featured/highlighted listing
  const isFeatured = variant === 'featured' || listing?.isFeatured;

  return (
    <Link
      to={listingId ? `/listing/${listingId}` : '#'}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <article 
        className={`
          relative flex flex-col overflow-hidden rounded-2xl bg-white
          transition-all duration-300 ease-out
          ${isHovered ? 'shadow-xl -translate-y-1' : 'shadow-md'}
          ${variant === 'compact' ? 'max-w-[280px]' : ''}
        `}
        style={{
          boxShadow: isHovered 
            ? '0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 8px 16px -8px rgba(0, 0, 0, 0.1)'
            : '0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={title}
              onError={handleImageError}
              className={`
                h-full w-full object-cover transition-transform duration-500
                ${isHovered ? 'scale-105' : 'scale-100'}
              `}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
              <Truck className="h-16 w-16 text-orange-300" />
            </div>
          )}
          
          {/* Badges overlay */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {deliveryAvailable && (
              <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
                Delivery Available
              </span>
            )}
            {listing?.isVerified && (
              <span className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                Verified
              </span>
            )}
          </div>
          
          {/* Save button */}
          {showSaveButton && listingId && (
            <SaveButtonOverlay listingId={listingId} />
          )}
          
          {/* Rating badge - bottom right of image */}
          {rating && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-sm font-semibold shadow-sm backdrop-blur-sm">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-slate-700">{rating}</span>
              {reviews > 0 && (
                <span className="text-slate-400">({reviews})</span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          {/* Title */}
          <h3 className={`
            text-lg font-bold leading-tight tracking-tight
            ${isFeatured ? 'text-[#E63946]' : 'text-slate-900'}
            group-hover:text-[#E63946] transition-colors
          `}>
            {title}
          </h3>
          
          {/* Description - truncated */}
          {description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
              {description}
            </p>
          )}
          
          {/* Amenities/Features badges */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {capacity && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Users className="h-4 w-4 text-slate-400" />
                <span>{capacity} {typeof capacity === 'number' && capacity === 1 ? 'Guest' : 'Guests'}</span>
              </div>
            )}
            {bedrooms && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                <span>{bedrooms} {bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
              </div>
            )}
            {tags.length > 0 && !capacity && !bedrooms && tags.slice(0, 2).map((tag, idx) => (
              <span 
                key={idx}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* Divider */}
          <div className="my-4 h-px bg-slate-100" />
          
          {/* Price and CTA row */}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">
                {price ? `$${typeof price === 'number' ? price.toLocaleString() : price}` : 'Contact'}
              </span>
              {price && priceUnit && (
                <span className="text-sm font-medium text-slate-400">
                  /{priceUnit === 'day' ? 'night' : priceUnit}
                </span>
              )}
            </div>
            
            {showBookButton && (
              <button 
                className={`
                  rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200
                  ${isHovered 
                    ? 'bg-[#E63946] text-white shadow-lg shadow-red-500/25' 
                    : 'bg-[#E63946] text-white'
                  }
                  hover:bg-[#D62839] active:scale-95
                `}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/listing/${listingId}`;
                }}
              >
                Book now
              </button>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

/**
 * Compact variant for carousels
 */
export function ListingCardCompact({ listing, showSaveButton = true }) {
  return (
    <ListingCard 
      listing={listing} 
      showSaveButton={showSaveButton}
      variant="compact"
      showBookButton={true}
    />
  );
}

/**
 * Featured variant with colored title
 */
export function ListingCardFeatured({ listing, showSaveButton = true }) {
  return (
    <ListingCard 
      listing={listing} 
      showSaveButton={showSaveButton}
      variant="featured"
      showBookButton={true}
    />
  );
}

/**
 * Horizontal scroll carousel for listings - Webflow style
 */
export function ListingCarousel({ 
  listings = [], 
  title = 'Explore listings',
  showBrowseAll = true,
  browseAllLink = '/listings'
}) {
  const containerRef = useRef(null);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  if (!listings.length) return null;

  return (
    <section className="relative py-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between px-4 sm:px-0">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h2>
        {showBrowseAll && (
          <Link 
            to={browseAllLink}
            className="group flex items-center gap-1 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow"
          >
            Browse all
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      {/* Carousel container */}
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={scrollLeft}
          className="absolute -left-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-slate-700" />
        </button>

        {/* Cards container */}
        <div 
          ref={containerRef}
          className="flex gap-6 overflow-x-auto scroll-smooth px-4 pb-4 sm:px-0"
          style={{ 
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {listings.map((listing, idx) => (
            <div 
              key={listing.id || idx}
              className="w-[300px] flex-shrink-0 sm:w-[320px]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={scrollRight}
          className="absolute -right-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#E63946] text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Hide scrollbar with CSS */}
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
