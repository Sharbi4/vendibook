import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Bed,
  Star,
  Heart,
  Truck,
  Calendar
} from 'lucide-react';
import LocationAutocomplete from '../components/LocationAutocomplete.jsx';
import VendibookMap from '../components/VendibookMap.jsx';
import { useListingsQuery } from '../hooks/useListingsQuery';
import AppLayout from '../layouts/AppLayout.jsx';
import {
  SEARCH_MODE,
  DISTANCE_FILTER_OPTIONS,
  buildSearchParamsFromFilters,
  deriveCityState,
  formatDateRange,
  getCategoryLabel,
  getCategoryOptionsForMode,
  getModeLabel,
  parseFiltersFromSearchParams
} from '../constants/filters';
import { haversineDistance } from '../utils/geo';

// Mode tabs matching Webflow style
const MODE_TABS = [
  { id: SEARCH_MODE.RENT, label: 'Rent', icon: '🚚' },
  { id: SEARCH_MODE.BUY, label: 'Buy', icon: '💰' },
  { id: SEARCH_MODE.EVENT_PRO, label: 'Event Pros', icon: '👨‍🍳' },
  { id: SEARCH_MODE.VENDOR_MARKET, label: 'Vendor Markets', icon: '🏪' }
];

// Conditional price ranges based on mode (rent vs sale)
const RENTAL_PRICE_RANGES = [
  { value: '', label: 'Any price' },
  { value: '0-100', label: 'Under $100/day' },
  { value: '100-250', label: '$100 – $250/day' },
  { value: '250-500', label: '$250 – $500/day' },
  { value: '500+', label: '$500+/day' }
];

const SALE_PRICE_RANGES = [
  { value: '', label: 'Any price' },
  { value: '0-20000', label: 'Under $20,000' },
  { value: '20000-50000', label: '$20,000 – $50,000' },
  { value: '50000-100000', label: '$50,000 – $100,000' },
  { value: '100000+', label: '$100,000+' }
];

// Function to get appropriate price ranges based on search mode
const getPriceRangesForMode = (mode) => {
  if (mode === SEARCH_MODE.BUY) {
    return SALE_PRICE_RANGES;
  }
  return RENTAL_PRICE_RANGES;
};

function parseCoordinate(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (value === '' || value == null) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function getListingId(listing, index) {
  if (!listing) return `listing-${index}`;
  return listing.id ?? `listing-${index}`;
}

// Webflow-style Listing Card Component
function ListingCardWebflow({ listing, isActive, onMouseEnter }) {
  const [imageError, setImageError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const listingId = listing?.id;
  const title = listing?.title || 'Untitled listing';
  const city = listing?.city || listing?.city_name || '';
  const state = listing?.state || listing?.state_code || '';
  const location = [city, state].filter(Boolean).join(', ') || 'Location TBD';
  const price = listing?.price ?? listing?.price_per_day ?? listing?.pricePerDay;
  const priceUnit = listing?.price_unit || listing?.priceUnit || 'night';
  const imageUrl = listing?.image_url || listing?.imageUrl || listing?.image;
  const deliveryAvailable = Boolean(listing?.delivery_available ?? listing?.deliveryAvailable);
  const guests = listing?.guests || listing?.capacity || listing?.capacityServed || null;
  const bedrooms = listing?.bedrooms || listing?.rooms || null;
  const description = listing?.description || '';

  return (
    <Link
      to={listingId ? `/listing/${listingId}` : '#'}
      className={`group block bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
        isActive ? 'ring-2 ring-orange-500 shadow-xl' : 'shadow-md hover:shadow-xl'
      }`}
      onMouseEnter={onMouseEnter}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50 text-6xl">
            🚚
          </div>
        )}
        
        {/* Save Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsSaved(!isSaved);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all"
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
        </button>

        {/* Badges */}
        {deliveryAvailable && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-900/80 text-white px-3 py-1 rounded-full text-xs font-semibold">
            <Truck className="w-3.5 h-3.5" />
            Delivery
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-orange-500 transition-colors">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-slate-500 mb-3 line-clamp-1">
          {description || 'Premium rental available for your next event or project.'}
        </p>

        {/* Features Row */}
        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
          {guests && (
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              <span>{guests} Guests</span>
            </div>
          )}
          {bedrooms && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-slate-400" />
              <span>{bedrooms} {bedrooms === 1 ? 'Unit' : 'Units'}</span>
            </div>
          )}
          {!guests && !bedrooms && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{location}</span>
            </div>
          )}
        </div>

        {/* Price and CTA Row */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <span className="text-xl font-bold text-slate-900">
              {price ? `$${typeof price === 'number' ? price.toLocaleString() : price}` : 'Contact'}
            </span>
            {price && (
              <span className="text-sm text-slate-500 ml-1">/{priceUnit}</span>
            )}
          </div>
          <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
            Book now
          </button>
        </div>
      </div>
    </Link>
  );
}

function ListingsPageRedesigned() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilters = useMemo(() => parseFiltersFromSearchParams(searchParams), [searchParams]);

  const [formFilters, setFormFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [activeListingId, setActiveListingId] = useState(null);
  const cardRefs = useRef({});

  const {
    listings,
    pagination,
    filters,
    isLoading,
    isError,
    error,
    refetch,
    setFilters,
    setPage
  } = useListingsQuery(initialFilters);

  const safeListings = Array.isArray(listings) ? listings : [];

  const searchCenter = useMemo(() => {
    const lat = parseCoordinate(appliedFilters.latitude);
    const lng = parseCoordinate(appliedFilters.longitude);
    if (lat == null || lng == null) return null;
    return { lat, lng };
  }, [appliedFilters.latitude, appliedFilters.longitude]);

  const listingsWithDistance = useMemo(() => {
    return safeListings.map((listing) => {
      const lat = parseCoordinate(listing.latitude ?? listing.lat);
      const lng = parseCoordinate(listing.longitude ?? listing.lng);
      const distanceFromSearch = searchCenter && lat != null && lng != null
        ? haversineDistance(searchCenter, { lat, lng })
        : null;
      return {
        ...listing,
        latitude: lat ?? listing.latitude ?? null,
        longitude: lng ?? listing.longitude ?? null,
        distanceFromSearch
      };
    });
  }, [safeListings, searchCenter]);

  const filteredListings = useMemo(() => {
    if (!appliedFilters.distanceMiles || !searchCenter) {
      return listingsWithDistance;
    }
    return listingsWithDistance.filter((listing) => {
      if (listing.distanceFromSearch == null) return true;
      return listing.distanceFromSearch <= appliedFilters.distanceMiles;
    });
  }, [appliedFilters.distanceMiles, listingsWithDistance, searchCenter]);

  const mapMarkers = useMemo(() => {
    return filteredListings
      .map((listing, index) => {
        const lat = parseCoordinate(listing.latitude);
        const lng = parseCoordinate(listing.longitude);
        if (lat == null || lng == null) return null;
        const price = listing.price ?? listing.price_per_day ?? listing.pricePerDay ?? null;
        return {
          id: getListingId(listing, index),
          lat,
          lng,
          title: listing.title,
          price
        };
      })
      .filter(Boolean);
  }, [filteredListings]);

  const mapCenter = useMemo(() => {
    if (searchCenter) return searchCenter;
    if (mapMarkers.length) return { lat: mapMarkers[0].lat, lng: mapMarkers[0].lng };
    return { lat: 33.4484, lng: -112.074 };
  }, [mapMarkers, searchCenter]);

  useEffect(() => {
    if (!filteredListings.length) {
      if (activeListingId !== null) setActiveListingId(null);
      return;
    }
    const hasActive = filteredListings.some((listing, index) => getListingId(listing, index) === activeListingId);
    if (!hasActive) {
      setActiveListingId(getListingId(filteredListings[0], 0));
    }
  }, [filteredListings, activeListingId]);

  const scrollListingIntoView = (listingId) => {
    const node = cardRefs.current[listingId];
    if (node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleMarkerClick = (listingId) => {
    setActiveListingId(listingId);
    scrollListingIntoView(listingId);
  };

  const currentPage = pagination?.page || filters.page || appliedFilters.page || 1;
  const totalPages = pagination?.pages || 1;
  const totalResults = filteredListings.length;

  const categoryOptions = useMemo(
    () => [{ value: '', label: 'All categories' }, ...getCategoryOptionsForMode(formFilters.mode)],
    [formFilters.mode]
  );

  const pushFiltersToUrl = (filtersToPush) => {
    const params = buildSearchParamsFromFilters(filtersToPush);
    setSearchParams(params, { replace: true });
  };

  useEffect(() => {
    setFormFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setFilters(initialFilters);
    if (initialFilters.page && initialFilters.page > 1) {
      setPage(initialFilters.page);
    }
  }, [initialFilters, setFilters, setPage]);

  const formLocationSelection = useMemo(() => {
    if (!formFilters.locationLabel && !formFilters.locationText) return null;
    return {
      label: formFilters.locationLabel || formFilters.locationText,
      placeName: formFilters.locationText || formFilters.locationLabel,
      city: formFilters.city,
      state: formFilters.state,
      lat: parseCoordinate(formFilters.latitude) ?? undefined,
      lng: parseCoordinate(formFilters.longitude) ?? undefined
    };
  }, [formFilters.locationLabel, formFilters.locationText, formFilters.latitude, formFilters.longitude, formFilters.city, formFilters.state]);

  const commitFilters = (updater) => {
    setAppliedFilters((prev) => {
      const draft = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      const next = { ...draft, page: 1 };
      next.locationText = draft.locationText ?? [next.city, next.state].filter(Boolean).join(', ');
      next.locationLabel = draft.locationLabel || next.locationText;
      const sanitizedLat = parseCoordinate(draft.latitude);
      const sanitizedLng = parseCoordinate(draft.longitude);
      next.latitude = sanitizedLat == null ? '' : sanitizedLat;
      next.longitude = sanitizedLng == null ? '' : sanitizedLng;
      next.distanceMiles = draft.distanceMiles || '';

      setFormFilters((formPrev) => ({ ...formPrev, ...next }));
      setFilters({
        mode: next.mode,
        city: next.city,
        state: next.state,
        listingType: next.listingType,
        startDate: next.startDate,
        endDate: next.endDate,
        latitude: next.latitude,
        longitude: next.longitude,
        distanceMiles: next.distanceMiles
      });
      pushFiltersToUrl(next);
      return next;
    });
  };

  const handleModeChange = (mode) => {
    setFormFilters((prev) => ({ ...prev, mode, listingType: '' }));
    commitFilters({ mode, listingType: '' });
  };

  const handleLocationSelect = (place) => {
    if (!place) {
      setFormFilters((prev) => ({
        ...prev,
        locationText: '',
        locationLabel: '',
        city: '',
        state: '',
        latitude: '',
        longitude: ''
      }));
      return;
    }

    setFormFilters((prev) => ({
      ...prev,
      locationText: place.placeName || place.label || '',
      locationLabel: place.label || place.placeName || '',
      city: place.city || prev.city,
      state: place.state || prev.state,
      latitude: typeof place.lat === 'number' ? place.lat : prev.latitude,
      longitude: typeof place.lng === 'number' ? place.lng : prev.longitude
    }));
  };

  const handleLocationQueryChange = (value) => {
    const derived = deriveCityState(value);
    setFormFilters((prev) => ({
      ...prev,
      locationText: value,
      locationLabel: value,
      city: derived.city,
      state: derived.state,
      latitude: '',
      longitude: ''
    }));
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    commitFilters(formFilters);
  };

  const handlePagination = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    setAppliedFilters((prev) => {
      const next = { ...prev, page: nextPage };
      pushFiltersToUrl(next);
      return next;
    });
    setFormFilters((prev) => ({ ...prev, page: nextPage }));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleChipRemove = (key) => {
    if (key === 'mode') {
      commitFilters({ mode: SEARCH_MODE.RENT, listingType: '' });
      return;
    }
    if (key === 'location') {
      commitFilters({ city: '', state: '', locationText: '', locationLabel: '', latitude: '', longitude: '' });
      return;
    }
    if (key === 'category') {
      commitFilters({ listingType: '' });
      return;
    }
    if (key === 'dates') {
      commitFilters({ startDate: '', endDate: '' });
      return;
    }
    if (key === 'distance') {
      commitFilters({ distanceMiles: '' });
    }
  };

  const activeChips = [];
  const locationLabel = appliedFilters.locationLabel || [appliedFilters.city, appliedFilters.state].filter(Boolean).join(', ');
  const categoryLabel = getCategoryLabel(appliedFilters.mode, appliedFilters.listingType);

  if (locationLabel) {
    activeChips.push({ key: 'location', label: locationLabel });
  }
  if (appliedFilters.listingType) {
    activeChips.push({ key: 'category', label: categoryLabel });
  }
  if (appliedFilters.startDate || appliedFilters.endDate) {
    activeChips.push({ key: 'dates', label: formatDateRange(appliedFilters.startDate, appliedFilters.endDate) });
  }
  if (appliedFilters.distanceMiles) {
    const option = DISTANCE_FILTER_OPTIONS.find((opt) => opt.value === appliedFilters.distanceMiles);
    activeChips.push({ key: 'distance', label: option?.label || `Within ${appliedFilters.distanceMiles} mi` });
  }

  return (
    <AppLayout fullWidth contentClassName="bg-white">
      {/* Hero Section with Search */}
      <section className="relative bg-slate-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-20">
          {/* Mode Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {MODE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleModeChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                  formFilters.mode === tab.id
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center mb-4">
            Find Your Perfect {getModeLabel(formFilters.mode)}
          </h1>
          <p className="text-lg text-white/70 text-center mb-10 max-w-2xl mx-auto">
            Discover verified mobile food assets, equipment, and event professionals in your area.
          </p>

          {/* Search Card */}
          <form onSubmit={handleFilterSubmit} className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_auto]">
              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Location
                </label>
                <LocationAutocomplete
                  value={formLocationSelection}
                  onChange={handleLocationSelect}
                  onQueryChange={handleLocationQueryChange}
                  placeholder="City, ZIP, or landmark"
                  className="!border-slate-200 !rounded-xl"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  name="listingType"
                  value={formFilters.listingType}
                  onChange={(e) => setFormFilters((prev) => ({ ...prev, listingType: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value || 'all'} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Distance */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Distance
                </label>
                <select
                  name="distanceMiles"
                  value={formFilters.distanceMiles || ''}
                  onChange={(e) => setFormFilters((prev) => ({ ...prev, distanceMiles: e.target.value ? Number(e.target.value) : '' }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                >
                  {DISTANCE_FILTER_OPTIONS.map((option) => (
                    <option key={option.value || 'any'} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  <span className="md:hidden lg:inline">Search</span>
                </button>
              </div>
            </div>

            {/* More Filters Toggle */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {advancedOpen ? 'Hide filters' : 'More filters'}
              </button>

              {/* Active Chips */}
              {activeChips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activeChips.map((chip) => (
                    <span
                      key={chip.key}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium"
                    >
                      {chip.label}
                      <button
                        type="button"
                        onClick={() => handleChipRemove(chip.key)}
                        className="hover:text-orange-900 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Advanced Filters Panel */}
            {advancedOpen && (
              <div className="mt-4 pt-4 border-t border-slate-200 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      name="startDate"
                      value={formFilters.startDate || ''}
                      onChange={(e) => setFormFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      name="endDate"
                      value={formFilters.endDate || ''}
                      onChange={(e) => setFormFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Price Range
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    {getPriceRangesForMode(formFilters.mode).map((range) => (
                      <option key={range.value || 'any'} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => commitFilters({
                      mode: SEARCH_MODE.RENT,
                      city: '',
                      state: '',
                      locationText: '',
                      locationLabel: '',
                      latitude: '',
                      longitude: '',
                      listingType: '',
                      startDate: '',
                      endDate: '',
                      distanceMiles: ''
                    })}
                    className="w-full px-4 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        {/* Results Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {totalResults} {totalResults === 1 ? 'listing' : 'listings'} available
            </h2>
            <p className="text-slate-500 mt-1">
              {appliedFilters.mode && getModeLabel(appliedFilters.mode)}
              {locationLabel && ` in ${locationLabel}`}
            </p>
          </div>
          
          {/* Mobile Map Toggle */}
          <button
            type="button"
            onClick={() => setShowMobileMap(!showMobileMap)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            {showMobileMap ? 'Hide map' : 'Show map'}
          </button>
        </div>

        {/* Mobile Map */}
        {showMobileMap && (
          <div className="lg:hidden mb-8 rounded-2xl overflow-hidden shadow-lg">
            <VendibookMap
              center={mapCenter}
              markers={mapMarkers}
              activeMarkerId={activeListingId}
              onMarkerClick={handleMarkerClick}
              className="h-[320px]"
            />
          </div>
        )}

        {/* Main Grid: Listings + Map */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* Listings Grid */}
          <div>
            {isLoading && (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
                  <p className="text-slate-600 font-medium">Loading listings...</p>
                </div>
              </div>
            )}

            {!isLoading && isError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                <p className="text-lg font-semibold text-red-700">Unable to load listings</p>
                <p className="mt-2 text-sm text-red-600">{error?.message || 'Something went wrong.'}</p>
                <button
                  type="button"
                  onClick={refetch}
                  className="mt-4 px-6 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            {!isLoading && !isError && filteredListings.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-xl font-semibold text-slate-800">No listings found</p>
                <p className="mt-2 text-slate-500 max-w-md mx-auto">
                  Try adjusting your search filters or expanding your location radius.
                </p>
                <button
                  type="button"
                  onClick={() => commitFilters({
                    mode: SEARCH_MODE.RENT,
                    city: '',
                    state: '',
                    locationText: '',
                    locationLabel: '',
                    latitude: '',
                    longitude: '',
                    listingType: '',
                    startDate: '',
                    endDate: '',
                    distanceMiles: ''
                  })}
                  className="mt-6 px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {!isLoading && !isError && filteredListings.length > 0 && (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredListings.map((listing, index) => {
                    const listingId = getListingId(listing, index);
                    const isActive = activeListingId === listingId;
                    return (
                      <div
                        key={listingId}
                        ref={(node) => {
                          if (node) cardRefs.current[listingId] = node;
                          else delete cardRefs.current[listingId];
                        }}
                      >
                        <ListingCardWebflow
                          listing={listing}
                          isActive={isActive}
                          onMouseEnter={() => setActiveListingId(listingId)}
                        />
                        {listing.distanceFromSearch != null && (
                          <p className="mt-2 text-xs text-slate-500 text-center">
                            ≈ {listing.distanceFromSearch.toFixed(1)} miles away
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination && totalPages > 1 && (
                  <div className="mt-12 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePagination(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className={`p-3 rounded-xl border transition-colors ${
                          currentPage <= 1
                            ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                            : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePagination(pageNum)}
                              className={`w-10 h-10 rounded-xl font-semibold transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-orange-500 text-white'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePagination(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className={`p-3 rounded-xl border transition-colors ${
                          currentPage >= totalPages
                            ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                            : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-500">
                      Page {currentPage} of {totalPages}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sticky Map (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl overflow-hidden shadow-lg">
              <VendibookMap
                center={mapCenter}
                markers={mapMarkers}
                activeMarkerId={activeListingId}
                onMarkerClick={handleMarkerClick}
                className="h-[600px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Have a food truck or equipment to list?
          </h2>
          <p className="text-lg text-white/70 mb-8">
            Join thousands of hosts earning on Vendibook. List your assets and start receiving bookings today.
          </p>
          <Link
            to="/host/listings/create"
            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/25"
          >
            Start listing
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </AppLayout>
  );
}

export default ListingsPageRedesigned;
