import { useEffect, useMemo, useState } from 'react';
import { useListings } from '../hooks/useListings.js';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  Store,
  Truck,
  Users,
  ShoppingCart,
  UtensilsCrossed
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';
import LocationAutocomplete from '../components/LocationAutocomplete.jsx';
import {
  ADVANCED_FILTER_PLACEHOLDERS,
  EVENT_PRO_SECONDARY_FILTERS,
  EVENT_TYPES,
  SERVICE_CATEGORIES,
  SEARCH_MODE,
  buildSearchParamsFromFilters,
  deriveCityState,
  formatDateRange,
  getCategoryIcon,
  getCategoryLabel,
  getCategoryOptionsForMode,
  getModeCtaCopy,
  parseFiltersFromSearchParams
} from '../constants/filters';

// TODO: Replace with curated Vendibook brand photography once the production asset is finalized.
const HERO_IMAGE_URL = '/images/hero-food-truck.jpg';
const CATEGORY_COLOR_PALETTE = ['#FF5124', '#FFB42C', '#343434', '#F8F8F8'];

// Sparkle Particle Component for Event Pro Mode
const SparkleParticle = ({ delay, left, size }) => (
  <div
    style={{
      position: 'absolute',
      left: `${left}%`,
      bottom: '0',
      width: `${size}px`,
      height: `${size}px`,
      background: '#FFB42C',
      borderRadius: '50%',
      opacity: 0,
      animation: `sparkleFloat 4s ${delay}s ease-in-out infinite`,
      boxShadow: `0 0 ${size * 2}px rgba(255, 180, 44, 0.6)`,
      pointerEvents: 'none'
    }}
  />
);

const VendibookGridIcon = ({ className = 'h-5 w-5 text-charcoal', strokeWidth = 1.75 }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="4" width="6" height="6" rx="1.25" />
    <rect x="14" y="4" width="6" height="6" rx="1.25" />
    <rect x="4" y="14" width="6" height="6" rx="1.25" />
    <rect x="14" y="14" width="6" height="6" rx="1.25" />
  </svg>
);

const CATEGORY_ICON_COMPONENTS = {
  truck: Truck,
  trailer: Truck,
  kitchen: UtensilsCrossed,
  map_pin: MapPin,
  users: Users,
  cart: ShoppingCart,
  store: Store,
  grid: VendibookGridIcon
};

const RECENT_SEARCHES = [
  { id: 'phoenix', label: 'Phoenix, AZ', meta: 'Food truck capitals' },
  { id: 'tucson', label: 'Tucson, AZ', meta: 'Pop-up friendly' },
  { id: 'scottsdale', label: 'Scottsdale, AZ', meta: 'Premium catering' },
  { id: 'tempe', label: 'Tempe, AZ', meta: 'University crowd' }
];

const POPULAR_CITY_CATEGORIES = {
  phoenix: ['Food trucks', 'Kitchen rentals', 'Event pros', 'Vendor markets'],
  tucson: ['Coffee carts', 'Markets', 'BBQ trailers'],
  scottsdale: ['Luxury catering', 'Chef partners', 'Brand activations'],
  default: ['Food trucks', 'Trailers', 'Host kitchens', 'Activation lots']
};

function HomePage() {
  const navigate = useNavigate();
  const locationObj = useLocation();

  const initialFilters = useMemo(
    () => parseFiltersFromSearchParams(new URLSearchParams(locationObj.search)),
    [locationObj.search]
  );

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  }, [initialFilters]);

  const parseCoordinate = (value) => {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    if (value === '' || value == null) {
      return null;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const locationSelection = useMemo(() => {
    if (!filters.locationLabel && !filters.locationText) {
      return null;
    }
    const lat = parseCoordinate(filters.latitude);
    const lng = parseCoordinate(filters.longitude);
    return {
      label: filters.locationLabel || filters.locationText,
      placeName: filters.locationText || filters.locationLabel,
      city: filters.city,
      state: filters.state,
      lat: lat ?? undefined,
      lng: lng ?? undefined
    };
  }, [filters.locationLabel, filters.locationText, filters.latitude, filters.longitude, filters.city, filters.state]);

  const modeOptions = [
    { id: SEARCH_MODE.RENT, label: 'Rent equipment' },
    { id: SEARCH_MODE.BUY, label: 'Buy equipment' },
    { id: SEARCH_MODE.EVENT_PRO, label: 'Book event pros' },
    { id: SEARCH_MODE.VENDOR_MARKET, label: 'Vendor markets' }
  ];

  const mapCategoryOptionsForMode = (mode) => (
    [{ value: '', label: 'All categories', iconName: 'grid' }, ...getCategoryOptionsForMode(mode)].map((option) => {
      const iconName = option.iconName || getCategoryIcon(option.value);
      const Icon = CATEGORY_ICON_COMPONENTS[iconName] || CATEGORY_ICON_COMPONENTS.grid;
      return { ...option, iconName, Icon };
    })
  );

  const modalCategoryOptions = useMemo(
    () => mapCategoryOptionsForMode(filters.mode),
    [filters.mode]
  );

  const appliedCategoryOptions = useMemo(
    () => (
      mapCategoryOptionsForMode(appliedFilters.mode).map((option, index) => ({
        ...option,
        color: CATEGORY_COLOR_PALETTE[index % CATEGORY_COLOR_PALETTE.length]
      }))
    ),
    [appliedFilters.mode]
  );
  const modalCtaLabel = getModeCtaCopy(filters.mode);
  const appliedCategoryLabel = getCategoryLabel(appliedFilters.mode, appliedFilters.listingType);
  const appliedLocationLabel = appliedFilters.locationLabel || appliedFilters.locationText || [appliedFilters.city, appliedFilters.state].filter(Boolean).join(', ');
  const normalizedCityKey = (filters.city || appliedFilters.city || '').toLowerCase();
  const popularCategoryChips = useMemo(() => {
    const list = POPULAR_CITY_CATEGORIES[normalizedCityKey] || POPULAR_CITY_CATEGORIES.default;
    return Array.isArray(list) ? list : POPULAR_CITY_CATEGORIES.default;
  }, [normalizedCityKey]);

  const recentSearchChips = useMemo(() => {
    if (!appliedLocationLabel) {
      return RECENT_SEARCHES;
    }
    const alreadyTracked = RECENT_SEARCHES.some((chip) => chip.label === appliedLocationLabel);
    if (alreadyTracked) {
      return RECENT_SEARCHES;
    }
    return [{ id: 'active-location', label: appliedLocationLabel }, ...RECENT_SEARCHES].slice(0, 5);
  }, [appliedLocationLabel]);
  const heroSummaryParts = [
    appliedLocationLabel || 'Any location',
    appliedCategoryLabel,
    formatDateRange(appliedFilters.startDate, appliedFilters.endDate)
  ];
  const heroSummary = heroSummaryParts.join(' • ');
  const listingResultsLabel = (() => {
    switch (appliedFilters.mode) {
      case SEARCH_MODE.EVENT_PRO:
        return 'event pros';
      case SEARCH_MODE.BUY:
        return 'listings for sale';
      case SEARCH_MODE.VENDOR_MARKET:
        return 'vendor markets';
      default:
        return 'rentals';
    }
  })();
  const listingsAreaLabel = appliedLocationLabel ? `in ${appliedLocationLabel}` : 'across Arizona';
  const applyAndSyncFilters = (updater) => {
    setAppliedFilters((prev) => {
      const nextState = typeof updater === 'function' ? updater(prev) : updater;
      const next = { ...nextState, page: 1 };
      if (!next.locationLabel && (next.city || next.state)) {
        next.locationLabel = [next.city, next.state].filter(Boolean).join(', ');
      }
      setFilters(next);
      return next;
    });
  };

  const handleModeChange = (mode) => {
    setFilters((prev) => ({
      ...prev,
      mode,
      listingType: ''
    }));
  };

  const handleCategoryChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      listingType: value
    }));
  };

  const handleLocationQueryChange = (value) => {
    const derived = deriveCityState(value);
    setFilters((prev) => ({
      ...prev,
      locationText: value,
      city: derived.city,
      state: derived.state,
      locationLabel: value,
      latitude: '',
      longitude: ''
    }));
  };

  const handleLocationSelect = (place) => {
    if (!place) {
      setFilters((prev) => ({
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

    setFilters((prev) => ({
      ...prev,
      locationText: place.placeName || place.label || '',
      locationLabel: place.label || place.placeName || '',
      city: place.city || prev.city,
      state: place.state || prev.state,
      latitude: typeof place.lat === 'number' ? place.lat : prev.latitude,
      longitude: typeof place.lng === 'number' ? place.lng : prev.longitude
    }));
  };

  const clearLocationFilter = () => {
    applyAndSyncFilters((prev) => ({
      ...prev,
      locationText: '',
      locationLabel: '',
      city: '',
      state: '',
      latitude: '',
      longitude: ''
    }));
  };

  const clearCategoryFilter = () => {
    applyAndSyncFilters((prev) => ({
      ...prev,
      listingType: ''
    }));
  };

  const clearDatesFilter = () => {
    applyAndSyncFilters((prev) => ({
      ...prev,
      startDate: '',
      endDate: ''
    }));
  };

  const clearAllFilters = () => {
    applyAndSyncFilters((prev) => ({
      ...prev,
      listingType: '',
      locationText: '',
      locationLabel: '',
      city: '',
      state: '',
      latitude: '',
      longitude: '',
      startDate: '',
      endDate: ''
    }));
  };

  const handleCategoryPillClick = (categoryValue) => {
    const nextFilters = {
      ...appliedFilters,
      mode: SEARCH_MODE.RENT,
      listingType: categoryValue
    };
    applyAndSyncFilters(nextFilters);
    const params = buildSearchParamsFromFilters(nextFilters);
    // Clicking hero chips routes directly to /listings for a faster browse handoff.
    navigate(`/listings?${params.toString()}`);
  };

  const activeFilterChips = [];
  const locationChipLabel = appliedLocationLabel;
  if (locationChipLabel) {
    activeFilterChips.push({ key: 'location', label: locationChipLabel, onRemove: clearLocationFilter });
  }
  if (appliedFilters.listingType) {
    activeFilterChips.push({ key: 'category', label: appliedCategoryLabel, onRemove: clearCategoryFilter });
  }
  if (appliedFilters.startDate || appliedFilters.endDate) {
    activeFilterChips.push({ key: 'dates', label: formatDateRange(appliedFilters.startDate, appliedFilters.endDate), onRemove: clearDatesFilter });
  }


  // Fetch dynamic listings from API (Neon) and merge with legacy mock data until fully migrated
  const { listings: dynamicListings, loading: listingsLoading } = useListings(appliedFilters);

  const mockListings = [
    {
      id: 1,
      title: 'Fully Equipped Taco Truck - LA Style',
      category: 'food-trucks',
      listingType: 'rent',
      location: 'Tucson, AZ',
      price: 250,
      priceType: 'day',
      image: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviews: 32,
      features: ['Power', 'Water', 'Propane', 'Full Kitchen'],
      host: 'Verified Host',
      deliveryAvailable: true
    },
    {
      id: 2,
      title: 'Wood-Fired Pizza Trailer - Professional Setup',
      category: 'trailers',
      listingType: 'rent',
      location: 'Phoenix, AZ',
      price: 180,
      priceType: 'day',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      reviews: 28,
      features: ['Power', 'Water', 'Wood-fired oven', 'Prep station'],
      host: 'Verified Host',
      deliveryAvailable: true
    },
    {
      id: 3,
      title: 'Premium Ghost Kitchen - 24/7 Access',
      category: 'ghost-kitchens',
      listingType: 'rent',
      location: 'Tucson, AZ',
      price: 150,
      priceType: 'day',
      image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviews: 15,
      features: ['Full kitchen', 'Storage', '24/7 access', 'Walk-in cooler'],
      host: 'Superhost',
      deliveryAvailable: false
    },
    {
      id: 4,
      title: 'Downtown Vending Location - High Traffic',
      category: 'vending-lots',
      listingType: 'rent',
      location: 'Tempe, AZ',
      price: 120,
      priceType: 'day',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
      reviews: 45,
      features: ['High foot traffic', 'Power hookup', 'Weekend events', 'Permits included'],
      host: 'Verified Host',
      deliveryAvailable: false
    },
    {
      id: 5,
      title: 'Award-Winning Chef - Mexican Cuisine',
      category: 'event-pros',
      listingType: 'event-pro',
      location: 'Phoenix, AZ',
      price: 75,
      priceType: 'hour',
      image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviews: 67,
      features: ['Certified', 'Catering license', 'Menu planning', '10+ years exp'],
      host: 'Superhost',
      deliveryAvailable: false
    },
    {
      id: 6,
      title: 'Vintage Coffee Cart - Fully Restored',
      category: 'trailers',
      listingType: 'rent',
      location: 'Scottsdale, AZ',
      price: 95,
      priceType: 'day',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80',
      rating: 4.6,
      reviews: 19,
      features: ['Espresso machine', 'Power', 'Compact', 'Instagram-worthy'],
      host: 'Verified Host',
      deliveryAvailable: true
    },
    {
      id: 7,
      title: '2022 Food Truck - Like New (For Sale)',
      category: 'for-sale',
      listingType: 'sale',
      location: 'Phoenix, AZ',
      price: 45000,
      priceType: 'sale',
      image: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviews: 8,
      features: ['Title verified', 'Low miles', 'Full inspection', 'Financing available'],
      host: 'Verified Seller',
      deliveryAvailable: true
    },
    {
      id: 8,
      title: 'BBQ Smoker Trailer - Competition Ready',
      category: 'trailers',
      listingType: 'rent',
      location: 'Mesa, AZ',
      price: 220,
      priceType: 'day',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviews: 52,
      features: ['Large smoker', 'Prep station', 'Power', 'Water hookup'],
      host: 'Superhost',
      deliveryAvailable: true
    }
  ];

  // Filter listings based on applied search
  const combinedListings = [...dynamicListings, ...mockListings];
  const locationQuery = (appliedLocationLabel || '').toLowerCase();
  const cityQuery = (appliedFilters.city || '').toLowerCase();
  const stateQuery = (appliedFilters.state || '').toLowerCase();
  const filteredListings = combinedListings.filter((listing) => {
    const listingMode = listing.listingType;
    if (appliedFilters.mode === SEARCH_MODE.RENT && listingMode !== 'rent') {
      return false;
    }
    if (appliedFilters.mode === SEARCH_MODE.BUY && listingMode !== 'sale') {
      return false;
    }
    if (appliedFilters.mode === SEARCH_MODE.EVENT_PRO && listingMode !== 'event-pro') {
      return false;
    }
    if (appliedFilters.mode === SEARCH_MODE.VENDOR_MARKET && listingMode !== 'vendor-market') {
      return false;
    }

    if (appliedFilters.listingType && listing.category !== appliedFilters.listingType) {
      return false;
    }

    if (locationQuery) {
      const listingLocation = listing.location.toLowerCase();
      if (!listingLocation.includes(locationQuery)) {
        return false;
      }
    }

    if (cityQuery) {
      if (!listing.location.toLowerCase().includes(cityQuery)) {
        return false;
      }
    }

    if (stateQuery) {
      if (!listing.location.toLowerCase().includes(stateQuery)) {
        return false;
      }
    }

    return true;
  });

  const handleSearch = () => {
    const derived = deriveCityState(filters.locationLabel || filters.locationText);
    const nextFilters = {
      ...filters,
      city: filters.city || derived.city,
      state: filters.state || derived.state,
      locationLabel: filters.locationLabel || filters.locationText || [derived.city, derived.state].filter(Boolean).join(', '),
      page: 1
    };
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    const params = buildSearchParamsFromFilters(nextFilters);
    setSearchModalOpen(false);
    navigate(`/listings?${params.toString()}`);
  };

  const handleBookNow = (listing) => {
    if (listing.category === 'for-sale') {
      alert(`Interested in purchasing: ${listing.title}\nPrice: $${listing.price.toLocaleString()}\n\nNext steps:\n- Schedule inspection\n- Get financing options\n- Contact seller`);
    } else {
      alert(`Book: ${listing.title}\nPrice: $${listing.price}/${listing.priceType}\nLocation: ${listing.location}\n\nNext: Select dates and confirm booking`);
    }
  };

  // Simple calendar component (can be replaced with a library if needed)
  const SimpleDatePicker = () => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

    const handleDateClick = (day) => {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      setFilters((prev) => {
        if (!prev.startDate || prev.endDate) {
          return { ...prev, startDate: dateStr, endDate: '' };
        }
        if (prev.startDate && !prev.endDate) {
          if (new Date(dateStr) >= new Date(prev.startDate)) {
            setShowCalendar(false);
            return { ...prev, endDate: dateStr };
          }
          return { ...prev, startDate: dateStr, endDate: '' };
        }
        return prev;
      });
    };

    const prevMonth = () => {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    };

    const nextMonth = () => {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    };

    const isSelected = (day) => {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return dateStr === filters.startDate || dateStr === filters.endDate;
    };

    const isInRange = (day) => {
      if (!filters.startDate || !filters.endDate) return false;
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const date = new Date(dateStr);
      return date > new Date(filters.startDate) && date < new Date(filters.endDate);
    };

    return (
      <div className="absolute left-0 top-full z-50 mt-3 w-full min-w-[280px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-700">
          <button type="button" onClick={prevMonth} className="rounded-full p-1 text-slate-500 hover:bg-slate-100">←</button>
          <div>{monthNames[currentMonth]} {currentYear}</div>
          <button type="button" onClick={nextMonth} className="rounded-full p-1 text-slate-500 hover:bg-slate-100">→</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const selected = isSelected(day);
            const inRange = isInRange(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDateClick(day)}
                className={`rounded-lg py-2 text-sm font-semibold transition ${
                  selected
                    ? 'bg-orange-500 text-white shadow-sm'
                    : inRange
                      ? 'bg-orange-50 text-slate-700'
                      : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && searchModalOpen) {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [searchModalOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (searchModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [searchModalOpen]);

  return (
    <AppLayout fullWidth contentClassName="bg-white">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-slate-950"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(3,7,18,0.95), rgba(15,23,42,0.55)), url(${HERO_IMAGE_URL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-orange-200">Mobile business marketplace</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Not sure? You can now <span className="text-orange-300">try it</span>.
            </h1>
            <p className="mt-4 text-lg text-white/80 sm:text-xl">
              From food trucks to vendor markets, Vendibook helps you test, launch, or scale every mobile concept with real inventory and real partners.
            </p>
            <div className="mt-8 grid gap-4 text-sm sm:grid-cols-3">
              {[{
                label: 'Verified hosts',
                value: '600+'
              }, {
                label: 'Markets & pop-ups',
                value: '120 every week'
              }, {
                label: 'Avg. booking time',
                value: '6 minutes'
              }].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-4xl">
            <div className="rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Current filters</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{heroSummary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchModalOpen(true)}
                  className="inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-orange-600"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {modalCtaLabel}
                </button>
              </div>
              <div className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Location</p>
                  <p className="mt-1 font-semibold text-slate-900">{locationChipLabel || 'Any city'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Category</p>
                  <p className="mt-1 font-semibold text-slate-900">{appliedCategoryLabel}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Dates</p>
                  <p className="mt-1 font-semibold text-slate-900">{formatDateRange(appliedFilters.startDate, appliedFilters.endDate)}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {appliedCategoryOptions.map((category) => {
                  const Icon = category.Icon;
                  const isActive = appliedFilters.listingType
                    ? appliedFilters.listingType === category.value
                    : category.value === '';
                  return (
                    <div
                      key={category.value || 'all-categories'}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'border-white/30 text-white/80'
                      }`}
                      style={{
                        borderColor: isActive ? category.color : 'rgba(255,255,255,0.3)'
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {category.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-[80]">
          <div
            className="absolute inset-0 bg-[#050608]/70 backdrop-blur-md"
            onClick={() => setSearchModalOpen(false)}
          />
          <div className="relative z-[85] flex min-h-full items-end justify-center px-4 pb-6 pt-10 sm:items-center">
            <div
              className="w-full max-w-4xl transform-gpu rounded-[32px] border border-white/30 bg-white/95 text-[#343434] shadow-[0_35px_120px_rgba(15,17,20,0.28)] backdrop-blur-2xl transition duration-300 ease-out animate-[vendibookModalEnter_0.4s_ease-out]"
              style={{ fontFamily: "'Sofia Pro Soft','Inter',sans-serif", paddingBottom: 'calc(env(safe-area-inset-bottom, 24px) + 24px)' }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex flex-col gap-4 border-b border-black/5 px-6 pb-6 pt-8 sm:flex-row sm:items-start sm:justify-between sm:px-10">
                <div className="max-w-2xl space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FFB42C]">Plan your next activation</p>
                  <h2 className="text-3xl font-bold text-[#343434]">Plan your next activation</h2>
                  <p className="text-sm text-[#5C5C5C]">
                    Search rentals, buy equipment, book event pros, or browse vendor markets — all from one polished modal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchModalOpen(false)}
                  className="ml-auto rounded-full border border-black/10 bg-white/80 p-2 text-[#343434] transition hover:scale-105 hover:border-[#FF5124] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB42C]"
                  aria-label="Close search modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-7 px-6 pt-6 sm:px-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FFB42C]">I'm looking to</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {modeOptions.map((option) => {
                      const isActive = filters.mode === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleModeChange(option.id)}
                          className={`rounded-full border px-4 py-3 text-sm font-semibold tracking-tight transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FFB42C] ${
                            isActive
                              ? 'border-[#FF5124] bg-[#FFE7DE] text-[#FF5124] shadow-[0_8px_25px_rgba(255,81,36,0.25)]'
                              : 'border-neutral-200 bg-white text-[#5C5C5C] hover:border-[#FF5124]/40 hover:scale-[0.98]'
                          }`}
                          aria-pressed={isActive}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <LocationAutocomplete
                    label="Location"
                    value={locationSelection}
                    onChange={handleLocationSelect}
                    onQueryChange={handleLocationQueryChange}
                    placeholder="Enter city & state"
                    className="rounded-[30px]"
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FFB42C]">Category</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {modalCategoryOptions.map((category) => {
                        const Icon = category.Icon;
                        const isActive = filters.listingType
                          ? filters.listingType === category.value
                          : category.value === '';
                        return (
                          <button
                            type="button"
                            key={category.value || 'all'}
                            onClick={() => handleCategoryChange(category.value)}
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition duration-150 ${
                              isActive
                                ? 'border-[#FF5124] bg-[#FFE7DE] text-[#FF5124] shadow-[0_6px_20px_rgba(255,81,36,0.25)]'
                                : 'border-neutral-200 bg-white text-[#5C5C5C] hover:border-[#FF5124]/40'
                            } hover:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB42C]`}
                            aria-pressed={isActive}
                          >
                            <Icon className="h-[18px] w-[18px] text-current" strokeWidth={1.8} />
                            <span>{category.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FFB42C]">Dates</p>
                  <div className="relative mt-3">
                    <button
                      type="button"
                      onClick={() => setShowCalendar((prev) => !prev)}
                      className="flex w-full items-center rounded-[28px] border border-[#E8E1DB] bg-white/90 px-5 py-3 pr-12 text-left text-sm font-semibold text-[#343434] shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB42C]"
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-medium uppercase tracking-[0.28em] text-[#A3A3A3]">Dates</span>
                        <span className="text-base font-semibold text-[#343434]">
                          {filters.startDate && filters.endDate
                            ? `${filters.startDate} → ${filters.endDate}`
                            : filters.startDate
                              ? `${filters.startDate} (select end date)`
                              : 'Select start & end dates'}
                        </span>
                      </div>
                      <Calendar className="pointer-events-none absolute right-6 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FF5124]" />
                    </button>
                    {showCalendar && <SimpleDatePicker />}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFilters((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-2xl border border-dashed border-[#F1E7DE] bg-[#FDF9F5] px-5 py-3 text-sm font-semibold text-[#FF5124] transition hover:border-[#FFB42C]"
                >
                  Advanced filters
                  {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showFilters && (
                  <div className="space-y-4 rounded-3xl border border-[#F1E7DE] bg-[#FFFCF9] p-5">
                    {ADVANCED_FILTER_PLACEHOLDERS.map((placeholder) => (
                      <div
                        key={placeholder.key}
                        className="rounded-2xl border border-dashed border-[#E4D7CB] bg-white/90 p-4"
                      >
                        <p className="text-sm font-semibold text-[#343434]">{placeholder.label}</p>
                        <p className="text-xs text-[#7C7C7C]">{placeholder.description}</p>
                        <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#FF5124]">
                          <Zap className="h-4 w-4" />
                          In sprint
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FFB42C]">Recently searched locations</p>
                    <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                      {recentSearchChips.map((chip) => (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => {
                            handleLocationQueryChange(chip.label);
                            handleLocationSelect({
                              label: chip.label,
                              placeName: chip.label,
                              city: chip.label.split(',')[0]?.trim(),
                              state: chip.label.split(',')[1]?.trim(),
                              lat: null,
                              lng: null
                            });
                          }}
                          className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-[#343434] shadow-sm transition hover:border-[#FF5124]/40 hover:text-[#FF5124]"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FFB42C]">Popular categories in your city</p>
                    <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                      {popularCategoryChips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-transparent bg-[#343434] px-4 py-2 text-sm font-semibold text-white shadow-sm"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[#5C5C5C]">Filters sync instantly with the listings grid so you can book faster.</p>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF5124] via-[#FF6A1F] to-[#FFB42C] px-8 py-4 text-base font-semibold text-white shadow-xl transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#FF5124] sm:w-auto"
                  >
                    <Search className="h-5 w-5" />
                    {modalCtaLabel || 'Search rentals'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Category Filter (existing sticky nav) */}
      <section style={{
        borderBottom: '1px solid #EDEDED',
        background: 'white',
        position: 'sticky',
        top: '80px',
        zIndex: 50,
        boxShadow: '0 1px 0 rgba(0,0,0,0.05)'
      }}>
        <div style={{ maxWidth: '1760px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '24px 0' }}>
            {appliedCategoryOptions.map((cat) => {
              const Icon = cat.Icon;
              const isActive = appliedFilters.listingType
                ? appliedFilters.listingType === cat.value
                : cat.value === '';
              return (
                <button
                  type="button"
                  key={cat.value || 'all-categories-nav'}
                  onClick={() => handleCategoryPillClick(cat.value)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    border: isActive ? `2px solid ${cat.color}` : '2px solid transparent',
                    borderRadius: '12px',
                    background: isActive ? `${cat.color}10` : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minWidth: '120px',
                    opacity: isActive ? 1 : 0.7
                  }}
                >
                  <Icon style={{
                    width: '24px',
                    height: '24px',
                    color: isActive ? cat.color : 'rgba(52, 52, 52, 0.65)'
                  }} />
                  <span style={{
                    fontSize: '12px',
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? cat.color : '#343434',
                    whiteSpace: 'nowrap'
                  }}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section style={{ maxWidth: '1760px', margin: '0 auto', padding: '48px 40px 80px' }}>
        {activeFilterChips.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
            {activeFilterChips.map((chip) => (
              <button
                type="button"
                key={chip.key}
                onClick={chip.onRemove}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  border: '1px solid #FF5124',
                  background: 'rgba(255, 81, 36, 0.05)',
                  color: '#FF5124',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {chip.label}
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: 'transparent',
                color: 'rgba(52, 52, 52, 0.65)',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Clear all
            </button>
          </div>
        )}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '600', color: '#343434', marginBottom: '8px' }}>
            {filteredListings.length} {listingResultsLabel} {listingsAreaLabel}
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(52, 52, 52, 0.65)' }}>
            {appliedCategoryLabel}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '40px 24px'
        }}>
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              style={{ cursor: 'pointer' }}
              onClick={() => handleBookNow(listing)}
            >
              <div style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '12px',
                aspectRatio: '20/19'
              }}>
                <img
                  src={listing.image}
                  alt={listing.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                {listing.deliveryAvailable && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Delivery Available
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#343434',
                    lineHeight: '1.3',
                    flex: 1
                  }}>
                    {listing.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
                    <span style={{ fontSize: '14px' }}>★</span>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{listing.rating}</span>
                    <span style={{ fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)' }}>({listing.reviews})</span>
                  </div>
                </div>

                <p style={{ fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '4px' }}>
                  {listing.location}
                </p>
                <p style={{ fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '8px' }}>
                  {listing.host}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {(listing.features || []).slice(0, 3).map((feature, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '11px',
                        color: 'rgba(52, 52, 52, 0.65)',
                        padding: '3px 8px',
                        background: '#F8F8F8',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <p style={{ fontSize: '15px', color: '#343434', marginTop: '8px' }}>
                  <span style={{ fontWeight: '600' }}>
                    ${listing.priceType === 'sale' ? listing.price.toLocaleString() : listing.price}
                  </span>
                  <span style={{ fontWeight: '400', color: 'rgba(52, 52, 52, 0.65)' }}>
                    {listing.priceType === 'sale' ? '' : ` / ${listing.priceType}`}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(52, 52, 52, 0.65)' }}>
            <Store style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
            <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No results found</p>
            <p style={{ fontSize: '15px' }}>Try adjusting your filters or search criteria</p>
          </div>
        )}
      </section>

      {/* How Vendibook Works Section */}
      <section style={{ background: '#F8F8F8', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '16px', color: '#343434' }}>
            How Vendibook Works
          </h2>
          <p style={{ fontSize: '18px', textAlign: 'center', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '60px' }}>
            Start your mobile business in three simple steps
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            {[
              {
                step: '1',
                icon: '🔍',
                title: 'Browse verified vehicles and kitchens',
                description: 'Search our marketplace of food trucks, trailers, ghost kitchens, and event pros. All equipment is inspected and hosts are verified.'
              },
              {
                step: '2',
                icon: '✅',
                title: 'Book secure rentals or event pros',
                description: 'Select your dates, choose your location, and book instantly. Flexible payment options and insurance included for peace of mind.'
              },
              {
                step: '3',
                icon: '🚀',
                title: 'Launch or grow your mobile business',
                description: 'Get your equipment delivered or pick it up. Start serving customers and growing your business with our ongoing support.'
              }
            ].map((item, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: '#FF5124',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '36px'
                }}>
                  {item.icon}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#FF5124',
                  marginBottom: '12px',
                  letterSpacing: '1px'
                }}>
                  STEP {item.step}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#343434' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '15px', color: 'rgba(52, 52, 52, 0.65)', lineHeight: '1.6' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section style={{ padding: '80px 40px', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '16px', color: '#343434' }}>
            Trusted by Mobile Business Owners
          </h2>
          <p style={{ fontSize: '18px', textAlign: 'center', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '60px' }}>
            Join hundreds of entrepreneurs who've launched with Vendibook
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {[
              {
                quote: "Vendibook made it so easy to start my taco truck business. Found the perfect truck, got it delivered, and was serving customers within a week!",
                author: "Maria Rodriguez",
                business: "Maria's Tacos, Phoenix",
                rating: 5
              },
              {
                quote: "As a ghost kitchen owner, Vendibook connects me with amazing chefs. The platform is reliable and the verification process gives me peace of mind.",
                author: "James Chen",
                business: "CloudKitchen AZ, Tempe",
                rating: 5
              },
              {
                quote: "I wanted to test my food concept before investing in my own truck. Vendibook let me rent by the week and see if my business idea worked. Now I'm thriving!",
                author: "Sarah Thompson",
                business: "Sweet Treats Mobile, Scottsdale",
                rating: 5
              }
            ].map((review, idx) => (
              <div key={idx} style={{
                padding: '32px',
                background: '#F8F8F8',
                borderRadius: '16px',
                border: '1px solid #EDEDED'
              }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} style={{ width: '16px', height: '16px', fill: '#FF5124', color: '#FF5124' }} />
                  ))}
                </div>
                <p style={{ fontSize: '15px', color: '#343434', lineHeight: '1.6', marginBottom: '20px', fontStyle: 'italic' }}>
                  "{review.quote}"
                </p>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#343434' }}>{review.author}</div>
                  <div style={{ fontSize: '13px', color: 'rgba(52, 52, 52, 0.65)' }}>{review.business}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: '#FF5124',
        padding: '80px 40px',
        marginTop: '0'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '42px', fontWeight: '700', color: 'white', marginBottom: '20px', letterSpacing: '-1px' }}>
            Ready to start your mobile business?
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.95)', marginBottom: '32px' }}>
            Browse equipment, book rentals, or list your own vehicles
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSearchModalOpen(true)}
              style={{
                background: 'white',
                color: '#FF5124',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              Browse Equipment
            </button>
            <button style={{
              background: 'rgba(0,0,0,0.2)',
              color: 'white',
              border: '2px solid white',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Become a Host
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#F8F8F8', padding: '48px 40px', marginTop: '0' }}>
        <div style={{ maxWidth: '1760px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '32px' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#343434' }}>Rent</h4>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Food Trucks</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Trailers</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Ghost Kitchens</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Vending Lots</a>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#343434' }}>Buy</h4>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Buy Equipment</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Financing Options</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Inspection Services</a>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#343434' }}>Host</h4>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Become a Host</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Host Protection</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Pricing Calculator</a>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#343434' }}>Support</h4>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Help Center</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>FAQ</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Contact Us</a>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #D8D8D8', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <p style={{ fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)' }}>
              © 2025 Vendibook LLC · All rights reserved
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#" style={{ fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', textDecoration: 'none' }}>Privacy</a>
              <a href="#" style={{ fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', textDecoration: 'none' }}>Terms</a>
              <a href="#" style={{ fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', textDecoration: 'none' }}>Sitemap</a>
              <button
                type="button"
                onClick={() => navigate('/about')}
                style={{ fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                About
              </button>
            </div>
          </div>
        </div>
      </footer>
    </AppLayout>
  );
}

export default HomePage;
