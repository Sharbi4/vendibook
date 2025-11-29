import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Users, Truck, MapPin, Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * ListingCardModern
 * Webflow-inspired listing card matching the rental template design
 * Features: image carousel, capacity badges, price/night, Book now CTA
 */
export default function ListingCardModern({ 
  listing, 
  variant = 'default', // 'default' | 'compact' | 'featured'
  showBookButton = true,
  onWishlistToggle
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const {
    id,
    title,
    description,
    image,
    image_url,
    imageUrl,
    images = [],
    price,
    price_per_day,
    priceUnit = 'day',
    location,
    city,
    state,
    rating,
    reviews,
    review_count,
    capacity,
    host,
    host_name,
    hostName,
    features = [],
    highlights = [],
    tags = [],
    amenities = [],
    deliveryAvailable,
    delivery_available,
    isVerified,
    listingType,
    listing_type
  } = listing;

  // Normalize data
  const displayImage = image || image_url || imageUrl;
  const allImages = images.length > 0 ? images : (displayImage ? [displayImage] : []);
  const displayLocation = location || [city, state].filter(Boolean).join(', ') || 'Location available';
  const displayPrice = price ?? price_per_day;
  const displayRating = rating || 'New';
  const displayReviews = reviews || review_count || 0;
  const displayHost = host || host_name || hostName;
  const displayDelivery = deliveryAvailable ?? delivery_available;
  const displayType = listingType || listing_type;
  
  // Combine all feature sources
  const allFeatures = [...new Set([...features, ...highlights, ...tags, ...amenities])].slice(0, 3);
  
  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onWishlistToggle?.(id, !isWishlisted);
  };

  const handleImageError = () => setImageError(true);

  // Featured variant - larger with more details
  if (variant === 'featured') {
    return (
      <Link
        to={id ? `/listing/${id}` : '#'}
        className="group block overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
      >
        {/* Image with carousel */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {allImages.length > 0 && !imageError ? (
            <img
              src={allImages[currentImageIndex]}
              alt={title}
              onError={handleImageError}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
              <Truck className="h-16 w-16 text-orange-300" />
            </div>
          )}

          {/* Image navigation */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-md backdrop-blur-sm transition-all hover:bg-white group-hover:opacity-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-md backdrop-blur-sm transition-all hover:bg-white group-hover:opacity-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                {allImages.slice(0, 5).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 w-1.5 rounded-full transition-all ${
                      idx === currentImageIndex ? 'w-4 bg-white' : 'bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-md backdrop-blur-sm transition-all hover:scale-110"
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-[#FF5A5F] text-[#FF5A5F]' : ''}`} />
          </button>

          {/* Badges */}
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
            {isVerified && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}
            {displayDelivery && (
              <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md backdrop-blur-sm">
                Delivery
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="mb-2 text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#FF5A5F]">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-500">
              {description}
            </p>
          )}

          {/* Feature badges */}
          <div className="mb-4 flex flex-wrap gap-2">
            {allFeatures.map((feature, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div className="mb-4 border-t border-slate-100" />

          {/* Price + CTA Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-900">
                {displayPrice ? `$${typeof displayPrice === 'number' ? displayPrice.toLocaleString() : displayPrice}` : 'Contact'}
              </span>
              {displayPrice && priceUnit && (
                <span className="text-sm text-slate-400">/{priceUnit}</span>
              )}
            </div>
            
            {showBookButton && (
              <span className="rounded-lg bg-[#FF5A5F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all group-hover:bg-[#E04E52] group-hover:shadow-md">
                Book now
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Default/Compact variant
  return (
    <Link
      to={id ? `/listing/${id}` : '#'}
      className="group block overflow-hidden rounded-xl bg-white transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
        {displayImage && !imageError ? (
          <img
            src={displayImage}
            alt={title}
            onError={handleImageError}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
            <Truck className="h-12 w-12 text-orange-300" />
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-md backdrop-blur-sm transition-all hover:scale-110"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-[#FF5A5F] text-[#FF5A5F]' : ''}`} />
        </button>

        {/* Badges */}
        {displayDelivery && (
          <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md backdrop-blur-sm">
            Delivery
          </span>
        )}
      </div>

      {/* Content */}
      <div className="pt-3">
        {/* Location + Rating row */}
        <div className="mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <MapPin className="h-3 w-3" />
            {displayLocation}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-700">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {displayRating}
            {displayReviews > 0 && <span className="text-slate-400">({displayReviews})</span>}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-slate-900">
          {title}
        </h3>

        {/* Host */}
        {displayHost && (
          <p className="mb-2 text-xs text-slate-500">{displayHost}</p>
        )}

        {/* Tags */}
        {allFeatures.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {allFeatures.slice(0, 2).map((feature, idx) => (
              <span
                key={idx}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
              >
                {feature}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <p className="text-sm">
          <span className="font-bold text-slate-900">
            {displayPrice ? `$${typeof displayPrice === 'number' ? displayPrice.toLocaleString() : displayPrice}` : 'Contact'}
          </span>
          {displayPrice && priceUnit && (
            <span className="text-slate-500"> / {priceUnit}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
