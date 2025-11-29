import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Users, Truck, MapPin, Star } from 'lucide-react';

/**
 * FeaturedListingsCarousel
 * Webflow-inspired horizontal carousel with navigation arrows
 * Matches the "Explore our cabins" section style from the rental template
 */
export default function FeaturedListingsCarousel({ 
  title = "Explore our listings",
  listings = [],
  browseAllLink = "/listings",
  browseAllLabel = "Browse all"
}) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [listings]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const cardWidth = 340; // Approximate card width + gap
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (!listings.length) return null;

  return (
    <section className="relative py-16 lg:py-20">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-[32px]">
            {title}
          </h2>
          <Link 
            to={browseAllLink}
            className="hidden rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-all hover:border-slate-300 hover:shadow-md sm:inline-flex"
          >
            {browseAllLabel}
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute -left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#FF5A5F] text-white shadow-lg transition-all hover:scale-105 hover:bg-[#E04E52] sm:-left-6"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute -right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#FF5A5F] text-white shadow-lg transition-all hover:scale-105 hover:bg-[#E04E52] sm:-right-6"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
            </button>
          )}

          {/* Scrollable Cards Container */}
          <div
            ref={scrollRef}
            className="scrollbar-hide flex gap-6 overflow-x-auto scroll-smooth pb-4"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} onClick={() => navigate(`/listing/${listing.id}`)} />
            ))}
          </div>
        </div>

        {/* Mobile Browse All */}
        <div className="mt-6 text-center sm:hidden">
          <Link 
            to={browseAllLink}
            className="inline-flex rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm"
          >
            {browseAllLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * ListingCard - Webflow Template Style
 * Clean white card with image, title, description, capacity badges, and price
 */
function ListingCard({ listing, onClick }) {
  const {
    id,
    title,
    description,
    image,
    image_url,
    imageUrl,
    price,
    priceUnit = 'day',
    location,
    city,
    state,
    rating,
    capacity,
    bedrooms,
    features = [],
    highlights = [],
    deliveryAvailable,
    isVerified
  } = listing;

  const displayImage = image || image_url || imageUrl;
  const displayLocation = location || [city, state].filter(Boolean).join(', ');
  const displayDescription = description?.slice(0, 100) || 'Premium mobile business equipment available for rent.';
  const displayFeatures = features.length ? features : highlights;
  
  // Parse capacity/specs for badges
  const capacityBadge = capacity || displayFeatures.find(f => f.toLowerCase().includes('guest') || f.toLowerCase().includes('operator'));
  const specBadge = bedrooms || displayFeatures.find(f => f.toLowerCase().includes('bedroom') || f.toLowerCase().includes('kitchen'));

  return (
    <article
      onClick={onClick}
      className="group flex w-[320px] flex-shrink-0 cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] sm:w-[340px]"
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {displayImage ? (
          <img
            src={displayImage}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
            <Truck className="h-16 w-16 text-orange-300" />
          </div>
        )}
        
        {/* Verified Badge */}
        {isVerified && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Verified
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Title - Highlighted color for featured */}
        <h3 className="mb-2 text-lg font-bold leading-snug text-slate-900 group-hover:text-[#FF5A5F]">
          {title}
        </h3>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {displayDescription}
        </p>

        {/* Capacity/Feature Badges */}
        <div className="mb-4 flex flex-wrap gap-2">
          {capacityBadge && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
              <Users className="h-3.5 w-3.5" />
              {typeof capacityBadge === 'number' ? `${capacityBadge} Guests` : capacityBadge}
            </span>
          )}
          {specBadge && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
              <Truck className="h-3.5 w-3.5" />
              {typeof specBadge === 'number' ? `${specBadge} Bedrooms` : specBadge}
            </span>
          )}
          {deliveryAvailable && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
              <MapPin className="h-3.5 w-3.5" />
              Delivery
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="mb-4 border-t border-slate-100" />

        {/* Price + CTA Row */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-900">
              ${typeof price === 'number' ? price.toLocaleString() : price}
            </span>
            {priceUnit && (
              <span className="text-sm text-slate-400">/{priceUnit}</span>
            )}
          </div>
          
          <button
            className="rounded-lg bg-[#FF5A5F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#E04E52] hover:shadow-md"
          >
            Book now
          </button>
        </div>
      </div>
    </article>
  );
}
