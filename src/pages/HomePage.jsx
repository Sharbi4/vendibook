import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Star, Check, Store, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import HeroSearch from '../components/home/HeroSearch.jsx';
import { CATEGORY_OPTIONS, CATEGORY_MAP, DEFAULT_CATEGORY } from '../config/categories.js';
import { useListings } from '../hooks/useListings.js';

const NAV_LINKS = [
  { label: 'Rent equipment', path: '/listings?intent=rent' },
  { label: 'Event pros', path: '/listings?intent=event-pro' },
  { label: 'Buy or lease', path: '/listings?intent=sale' },
  { label: 'Become a host', path: '/become-host' },
  { label: 'Community', path: '/community' },
];

const AMENITY_OPTIONS = [
  'Power',
  'Water',
  'Propane',
  'Full kitchen',
  'Storage',
  'Delivery available',
  'High foot traffic',
];

const CATEGORY_COLORS = {
  all: '#FF5124',
  'food-trucks': '#FF6B35',
  trailers: '#FF8C42',
  'ghost-kitchens': '#FFA500',
  'event-pros': '#FF6B6B',
  'vending-lots': '#FFB347',
};

const FALLBACK_LISTINGS = [
  {
    id: '1',
    title: 'Fully Equipped Taco Truck - LA Style',
    category: 'food-trucks',
    location: 'Tucson, AZ',
    price: 250,
    priceType: 'day',
    image: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: 32,
    features: ['Power', 'Water', 'Propane', 'Full kitchen'],
    host: 'Verified Host',
    deliveryAvailable: true,
    verified: true,
  },
  {
    id: '2',
    title: 'Wood-Fired Pizza Trailer - Professional Setup',
    category: 'trailers',
    location: 'Phoenix, AZ',
    price: 180,
    priceType: 'day',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews: 28,
    features: ['Power', 'Water', 'Wood-fired oven', 'Prep station'],
    host: 'Verified Host',
    deliveryAvailable: true,
    verified: true,
  },
  {
    id: '3',
    title: 'Premium Ghost Kitchen - 24/7 Access',
    category: 'ghost-kitchens',
    location: 'Tucson, AZ',
    price: 150,
    priceType: 'day',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80',
    rating: 5,
    reviews: 15,
    features: ['Full kitchen', 'Storage', '24/7 access', 'Walk-in cooler'],
    host: 'Superhost',
    deliveryAvailable: false,
    verified: true,
  },
  {
    id: '4',
    title: 'Downtown Vending Location - High Traffic',
    category: 'vending-lots',
    location: 'Tempe, AZ',
    price: 120,
    priceType: 'day',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviews: 45,
    features: ['High foot traffic', 'Power hookup', 'Weekend events', 'Permits included'],
    host: 'Verified Host',
    deliveryAvailable: false,
    verified: true,
  },
  {
    id: '5',
    title: 'Award-Winning Chef - Mexican Cuisine',
    category: 'event-pros',
    location: 'Phoenix, AZ',
    price: 75,
    priceType: 'hour',
    image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: 67,
    features: ['Certified', 'Catering license', 'Menu planning', '10+ years exp'],
    host: 'Superhost',
    deliveryAvailable: false,
    verified: true,
  },
  {
    id: '6',
    title: 'Vintage Coffee Cart - Fully Restored',
    category: 'trailers',
    location: 'Scottsdale, AZ',
    price: 95,
    priceType: 'day',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviews: 19,
    features: ['Espresso machine', 'Power', 'Compact', 'Instagram-worthy'],
    host: 'Verified Host',
    deliveryAvailable: true,
    verified: true,
  },
  {
    id: '7',
    title: '2022 Food Truck - Like New (For Sale)',
    category: 'for-sale',
    location: 'Phoenix, AZ',
    price: 45000,
    priceType: 'sale',
    image: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&auto=format&fit=crop&q=80',
    rating: 5,
    reviews: 8,
    features: ['Title verified', 'Low miles', 'Full inspection', 'Financing available'],
    host: 'Verified Seller',
    deliveryAvailable: true,
    verified: true,
  },
  {
    id: '8',
    title: 'BBQ Smoker Trailer - Competition Ready',
    category: 'trailers',
    location: 'Mesa, AZ',
    price: 220,
    priceType: 'day',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: 52,
    features: ['Large smoker', 'Prep station', 'Power', 'Water hookup'],
    host: 'Superhost',
    deliveryAvailable: true,
    verified: true,
  },
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80';

function normalizeListing(item) {
  const rawCategory = (item.category || '').toString().toLowerCase();
  const listingType = (item.listing_type || item.listingType || '').toString().toUpperCase();
  const category = rawCategory || (listingType === 'EVENT_PRO' ? 'event-pros' : rawCategory || 'all');
  const priceUnit = (item.price_unit || item.priceUnit || '').toString().toLowerCase();
  let priceType = 'day';
  if (priceUnit.includes('hour')) {
    priceType = 'hour';
  } else if (priceUnit.includes('sale') || listingType === 'SALE') {
    priceType = 'sale';
  } else if (priceUnit.includes('event')) {
    priceType = 'event';
  }

  const featureList =
    (Array.isArray(item.features) && item.features.length > 0)
      ? item.features
      : Array.isArray(item.tags)
        ? item.tags
        : Array.isArray(item.highlights)
          ? item.highlights
          : [];

  return {
    id: item.id || item.listingId || crypto.randomUUID(),
    title: item.title || 'Untitled listing',
    category,
    location:
      item.location ||
      [item.city, item.state].filter(Boolean).join(', ') ||
      'Phoenix, AZ',
    price: Number(item.price) || 0,
    priceType,
    image: item.image || item.imageUrl || item.image_url || FALLBACK_IMAGE,
    rating: Number(item.rating) || 4.8,
    reviews: item.reviewCount || item.review_count || 12,
    features: featureList,
    amenities: featureList.map((feature) => feature.toLowerCase()),
    host: item.host || item.hostName || item.host_name || 'Verified Host',
    deliveryAvailable: Boolean(item.deliveryAvailable ?? item.delivery_available ?? false),
    verified: Boolean(item.isVerified ?? item.is_verified ?? true),
  };
}

function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, needsVerification } = useAuth();

  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [appliedSearch, setAppliedSearch] = useState({
    location: '',
    startDate: '',
    endDate: '',
    category: DEFAULT_CATEGORY.value,
    listingType: DEFAULT_CATEGORY.listingIntent,
    priceMin: '',
    priceMax: '',
    amenities: [],
    deliveryOnly: false,
    verifiedOnly: false,
  });

  const listingFilters = useMemo(() => {
    const filters = {};
    if (appliedSearch.listingType && appliedSearch.listingType !== 'all') {
      if (appliedSearch.listingType === 'event-pro') {
        filters.listing_type = 'EVENT_PRO';
      } else if (appliedSearch.listingType === 'sale') {
        filters.listing_type = 'SALE';
      } else {
        filters.listing_type = 'RENT';
      }
    }
    if (appliedSearch.category && appliedSearch.category !== 'all') {
      filters.category = appliedSearch.category;
    }
    return filters;
  }, [appliedSearch.category, appliedSearch.listingType]);

  const { listings, isLoading } = useListings(listingFilters);

  const normalizedListings = useMemo(() => {
    if (Array.isArray(listings) && listings.length > 0) {
      return listings.map(normalizeListing);
    }
    return FALLBACK_LISTINGS.map((listing) => ({
      ...listing,
      amenities: listing.features.map((feature) => feature.toLowerCase()),
    }));
  }, [listings]);

  const heroLocationLabel = appliedSearch.location
    ? `Near ${appliedSearch.location}`
    : 'All locations';
  const heroCategoryLabel = CATEGORY_MAP[appliedSearch.category]?.label || 'All categories';
  const heroDateLabel =
    appliedSearch.startDate && appliedSearch.endDate
      ? `${appliedSearch.startDate} → ${appliedSearch.endDate}`
      : 'Flexible dates';

  const currentSearchPayload = useMemo(
    () => ({
      location: appliedSearch.location,
      category: appliedSearch.category,
      listingIntent: appliedSearch.listingType,
      startDate: appliedSearch.startDate,
      endDate: appliedSearch.endDate,
    }),
    [
      appliedSearch.location,
      appliedSearch.category,
      appliedSearch.listingType,
      appliedSearch.startDate,
      appliedSearch.endDate,
    ]
  );

  const handleSearch = (formValues = {}, filterOverrides = {}) => {
    const rawLocation = formValues.location?.trim() || '';
    const nextCategory = formValues.category || appliedSearch.category;
    const listingIntent = formValues.listingIntent || appliedSearch.listingType || 'all';
    const nextStartDate = formValues.startDate || '';
    const nextEndDate = formValues.endDate || '';
    const nextPriceMin = filterOverrides.priceMin ?? priceMin;
    const nextPriceMax = filterOverrides.priceMax ?? priceMax;
    const nextDeliveryOnly = filterOverrides.deliveryOnly ?? deliveryOnly;
    const nextVerifiedOnly = filterOverrides.verifiedOnly ?? verifiedOnly;
    const nextAmenities = filterOverrides.amenities ?? selectedAmenities;

    const params = new URLSearchParams();
    if (rawLocation) params.set('location', rawLocation);
    if (nextCategory && nextCategory !== 'all') params.set('category', nextCategory);
    if (listingIntent && listingIntent !== 'all') params.set('intent', listingIntent);
    if (nextStartDate) params.set('start', nextStartDate);
    if (nextEndDate) params.set('end', nextEndDate);
    if (nextPriceMin) params.set('price_min', nextPriceMin);
    if (nextPriceMax) params.set('price_max', nextPriceMax);
    if (nextDeliveryOnly) params.set('delivery', 'true');
    if (nextVerifiedOnly) params.set('verified', 'true');
    nextAmenities.forEach((amenity) => params.append('amenity', amenity));

    navigate(params.toString() ? `/listings?${params.toString()}` : '/listings');

    setAppliedSearch({
      location: rawLocation,
      startDate: nextStartDate,
      endDate: nextEndDate,
      category: nextCategory,
      listingType: listingIntent,
      priceMin: nextPriceMin,
      priceMax: nextPriceMax,
      amenities: nextAmenities,
      deliveryOnly: nextDeliveryOnly,
      verifiedOnly: nextVerifiedOnly,
    });
  };

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity]
    );
  };

  const handleApplyFilters = () => {
    handleSearch(currentSearchPayload);
  };

  const handleClearFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setSelectedAmenities([]);
    setDeliveryOnly(false);
    setVerifiedOnly(false);
    handleSearch(currentSearchPayload, {
      priceMin: '',
      priceMax: '',
      amenities: [],
      deliveryOnly: false,
      verifiedOnly: false,
    });
  };

  const filteredListings = useMemo(
    () =>
      normalizedListings.filter((listing) => {
        if (deliveryOnly && !listing.deliveryAvailable) {
          return false;
        }
        if (verifiedOnly && !listing.verified) {
          return false;
        }
        if (priceMin && Number(listing.price) < Number(priceMin)) {
          return false;
        }
        if (priceMax && Number(listing.price) > Number(priceMax)) {
          return false;
        }
        if (
          selectedAmenities.length &&
          !selectedAmenities.every((amenity) =>
            (listing.amenities || []).some((value) => value.toLowerCase().includes(amenity.toLowerCase()))
          )
        ) {
          return false;
        }
        if (appliedSearch.category && appliedSearch.category !== 'all') {
          return listing.category === appliedSearch.category;
        }
        return true;
      }),
    [
      normalizedListings,
      deliveryOnly,
      verifiedOnly,
      priceMin,
      priceMax,
      selectedAmenities,
      appliedSearch.category,
    ]
  );

  const categoryChips = useMemo(
    () =>
      CATEGORY_OPTIONS.map((option) => ({
        ...option,
        color: CATEGORY_COLORS[option.value] || '#FF5124',
      })),
    []
  );

  const handleCategoryClick = (value) => {
    const nextIntent = CATEGORY_MAP[value]?.listingIntent || 'all';
    setAppliedSearch((prev) => ({
      ...prev,
      category: value,
      listingType: nextIntent,
    }));
  };

  const handleBookNow = (listing) => {
    if (listing.category === 'for-sale' || listing.priceType === 'sale') {
      alert(
        `Interested in purchasing: ${listing.title}\nPrice: $${listing.price.toLocaleString()}\n\nNext steps:\n- Schedule inspection\n- Get financing options\n- Contact seller`
      );
      return;
    }
    alert(
      `Book: ${listing.title}\nPrice: $${listing.price}/${listing.priceType}\nLocation: ${listing.location}\n\nNext: Select dates and confirm booking`
    );
  };

  const marketStats = useMemo(() => {
    const verified = normalizedListings.filter((listing) => listing.verified).length;
    const delivery = normalizedListings.filter((listing) => listing.deliveryAvailable).length;
    const locations = new Set(
      normalizedListings
        .map((listing) => listing.location?.toString().trim())
        .filter(Boolean)
    ).size;
    return {
      total: normalizedListings.length,
      verified,
      delivery,
      markets: locations || 1,
    };
  }, [normalizedListings]);

  const toggleAmenityButtonStyle = (isActive) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderRadius: '999px',
    border: isActive ? '1px solid #FF5124' : '1px solid #E0E0E0',
    background: isActive ? 'rgba(255,81,36,0.08)' : 'white',
    color: isActive ? '#FF5124' : '#222',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  });

  return (
    <main className="bg-slate-50 pb-24 text-slate-900">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-60 bg-gradient-to-b from-orange-500/30 to-transparent" />
          <div className="absolute right-[-25%] top-[-10%] h-[420px] w-[420px] rounded-full bg-orange-400/25 blur-[160px]" />
          <div className="absolute left-[-15%] bottom-[-30%] h-[360px] w-[360px] rounded-full bg-rose-500/20 blur-[180px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_minmax(0,0.9fr)] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-orange-100">
                <Truck className="h-4 w-4" strokeWidth={1.6} />
                Arizona marketplace
              </span>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Launch, rent, or scale your mobile food business with vetted equipment, pros, and locations.
              </h1>
              <p className="max-w-2xl text-base text-white/80 sm:text-lg">
                Vendibook keeps your pipeline full with ready-to-work food trucks, commissary kitchens, vending lots,
                and event professionals across Arizona. Filter by amenities, delivery options, and verification status to move fast.
              </p>
              <div className="flex flex-wrap gap-3">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => navigate(link.path)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-3 text-sm font-semibold text-white/80">
                    <Sparkles className="h-5 w-5 text-orange-200" />
                    Active listings
                  </div>
                  <dd className="mt-2 text-3xl font-semibold">{marketStats.total || 0}+</dd>
                  <p className="text-sm text-white/70">Curated for high-performing concepts</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-3 text-sm font-semibold text-white/80">
                    <Check className="h-5 w-5 text-emerald-200" />
                    Verified hosts
                  </div>
                  <dd className="mt-2 text-3xl font-semibold">{marketStats.verified || 0}</dd>
                  <p className="text-sm text-white/70">Identity + compliance reviewed</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-3 text-sm font-semibold text-white/80">
                    <Store className="h-5 w-5 text-sky-200" />
                    Markets served
                  </div>
                  <dd className="mt-2 text-3xl font-semibold">{marketStats.markets}</dd>
                  <p className="text-sm text-white/70">{heroLocationLabel}</p>
                </div>
              </dl>
            </div>
            <div className="space-y-6">
              <div className="rounded-[32px] border border-white/20 bg-white/95 p-6 text-slate-900 shadow-[0_35px_120px_rgba(0,0,0,0.35)]">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Plan your next activation</p>
                <div className="mt-4">
                  <HeroSearch
                    initialValues={{
                      location: appliedSearch.location,
                      startDate: appliedSearch.startDate,
                      endDate: appliedSearch.endDate,
                      category: appliedSearch.category,
                    }}
                    onSubmit={handleSearch}
                  />
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  Results sync in real time with marketplace filters. Keep scrolling to apply amenities, price bands, and delivery preferences.
                </p>
              </div>
              {needsVerification && (
                <div className="rounded-2xl border border-orange-200/60 bg-orange-500/10 p-4 text-sm text-orange-50">
                  <p className="font-semibold">Finish verification to unlock instant bookings.</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-orange-50/80">
                    <span>1. Confirm email</span>
                    <span>2. Add business docs</span>
                    <span>3. Receive approval</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/verify-email')}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/20"
                  >
                    Verify account
                  </button>
                </div>
              )}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/90 backdrop-blur">
                <p>
                  {isAuthenticated
                    ? 'Signed in with priority access. Saved searches help us ping you when a matching truck, commissary, or lot drops.'
                    : 'Sign in to save searches, message hosts instantly, and get notified when new lots or trucks match your filters.'}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-orange-200">
                  <Sparkles className="h-3 w-3" />
                  Curated for {heroCategoryLabel.toLowerCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Showing</p>
              <h2 className="text-2xl font-semibold text-slate-900">{heroLocationLabel}</h2>
              <p className="text-sm text-slate-500">
                {filteredListings.length} matches · {heroCategoryLabel} · {heroDateLabel}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
              >
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {showFilters ? 'Hide filters' : 'Show filters'}
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-black"
              >
                Refresh results
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {categoryChips.map((chip) => {
              const isActive = chip.value === appliedSearch.category;
              return (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => handleCategoryClick(chip.value)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'border-transparent bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                  style={{ boxShadow: isActive ? `0 10px 30px ${chip.color}30` : undefined }}
                >
                  {chip.icon && <chip.icon className="h-4 w-4" />}
                  {chip.label}
                </button>
              );
            })}
          </div>

          {showFilters && (
            <div className="mt-6 space-y-6 rounded-3xl border border-slate-100 bg-slate-50/70 p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <label className="text-sm font-semibold text-slate-600">
                  Min price
                  <input
                    type="number"
                    inputMode="numeric"
                    value={priceMin}
                    onChange={(event) => setPriceMin(event.target.value)}
                    placeholder="0"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-medium text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-600">
                  Max price
                  <input
                    type="number"
                    inputMode="numeric"
                    value={priceMax}
                    onChange={(event) => setPriceMax(event.target.value)}
                    placeholder="500"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-medium text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </label>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Amenities</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {AMENITY_OPTIONS.map((option) => {
                    const normalized = option.toLowerCase();
                    const isActive = selectedAmenities.includes(normalized);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleAmenityToggle(normalized)}
                        style={toggleAmenityButtonStyle(isActive)}
                      >
                        {isActive && <Check className="h-4 w-4" />}
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={deliveryOnly}
                    onChange={(event) => setDeliveryOnly(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                  />
                  Delivery available
                </label>
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(event) => setVerifiedOnly(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                  />
                  Verified hosts only
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600"
                >
                  Apply filters
                </button>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center justify-center rounded-full border border-transparent px-5 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Featured marketplace picks</h2>
            <p className="text-sm text-slate-500">Shortlist updates automatically as you adjust filters.</p>
          </div>
          <div className="text-sm font-semibold text-slate-600">
            {filteredListings.length} available · {marketStats.delivery} delivery ready
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-12 text-center text-sm text-slate-500">
            Syncing the latest trucks, trailers, and pros…
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-12 text-center text-sm text-slate-500">
            No listings match those filters. Try clearing a few amenities or widening your price range.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredListings.map((listing) => (
              <article key={listing.id} className="group flex flex-col overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <div className="relative">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4 text-xs font-semibold">
                    {listing.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-emerald-600 shadow">
                        <Check className="h-3 w-3" />
                        Verified host
                      </span>
                    )}
                    {listing.deliveryAvailable && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 text-white">
                        <Truck className="h-3.5 w-3.5" strokeWidth={1.6} />
                        Delivery ready
                      </span>
                    )}
                  </div>
                  <span className="absolute bottom-3 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800">
                    {listing.priceType === 'sale'
                      ? 'For sale'
                      : listing.priceType === 'hour'
                        ? 'Per hour'
                        : listing.priceType === 'event'
                          ? 'Per event'
                          : 'Per day'}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-4 px-6 py-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{listing.location}</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">{listing.title}</h3>
                    <p className="text-sm text-slate-500">Hosted by {listing.host}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                      <span>{Number(listing.rating).toFixed(1)}</span>
                      <span className="text-slate-400">({listing.reviews} reviews)</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-slate-900">
                        ${listing.price.toLocaleString()}
                        {listing.priceType === 'sale' ? null : (
                          <span className="ml-1 text-sm font-medium text-slate-500">/{listing.priceType}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <ul className="flex flex-wrap gap-2 text-xs text-slate-500">
                    {listing.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                        <Check className="h-3 w-3 text-slate-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleBookNow(listing)}
                      className="flex-1 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                    >
                      {listing.priceType === 'sale' ? 'Inquire to buy' : 'Book now'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/listing/${listing.id}`)}
                      className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300"
                    >
                      View details
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-[36px] bg-gradient-to-r from-orange-500 via-rose-500 to-red-500 p-10 text-white shadow-[0_40px_120px_rgba(244,63,94,0.35)]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Hosts</p>
              <h3 className="mt-3 text-3xl font-semibold">List your truck, kitchen, or lot in minutes.</h3>
              <p className="mt-3 text-base text-white/80">
                Tap into vetted operators, instant payouts, and marketing support. We back every activation with contracts and insurance guidance.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/become-host')}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-rose-600 shadow-lg shadow-white/30 transition hover:shadow-white/50"
              >
                Become a host
              </button>
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Create free account
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
