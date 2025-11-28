import { useEffect, useMemo, useState } from 'react';
import { useListings } from '../hooks/useListings.js';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Star,
  CheckCircle,
  Shield,
  Truck,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';
import {
  EVENT_TYPES,
  LISTING_TYPES,
  SERVICE_CATEGORIES,
  SEARCH_MODE,
  buildSearchParamsFromFilters,
  deriveCityState,
  parseFiltersFromSearchParams
} from '../constants/filters';

const SPARKLE_COUNT = 50;

const RENT_CATEGORIES = [
  { label: '🚚 Food Trucks', value: LISTING_TYPES.FOOD_TRUCK },
  { label: '🎪 Trailers', value: LISTING_TYPES.TRAILER },
  { label: '🍴 Ghost Kitchens', value: LISTING_TYPES.GHOST_KITCHEN },
  { label: '📍 Vending Lots', value: LISTING_TYPES.VENDING_LOT },
  { label: '⚙️ Equipment', value: '' }
];

const SALE_CATEGORIES = [
  { label: '🚚 Food Trucks', value: 'food-trucks-sale' },
  { label: '🎪 Trailers', value: 'trailers-sale' },
  { label: '🍴 Ghost Kitchen Equipment', value: 'ghost-kitchen-sale' },
  { label: '📍 Vending Machines', value: 'vending-sale' },
  { label: '⚙️ Commercial Equipment', value: 'equipment-sale' }
];

const RENT_DURATION_OPTIONS = ['Daily', 'Weekly', 'Monthly'];
const RENT_SIZE_OPTIONS = ['Small', 'Medium', 'Large', 'XL'];
const RENT_RATING_OPTIONS = ['4.0+', '4.5+', '5.0'];

const SALE_YEAR_OPTIONS = ['2024', '2023', '2022', '2021', 'Older'];
const SALE_SIZE_OPTIONS = ['Compact', 'Standard', 'Extended', 'XL'];
const SALE_CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const SALE_TITLE_OPTIONS = ['Clean', 'Salvage', 'Rebuilt'];
const SALE_EQUIPMENT_OPTIONS = ['Generator', 'POS System', 'Kitchen Package', 'Exterior Wrap', 'Permits Included'];

const EVENT_MIN_RATINGS = ['Any', '4.0+', '4.5+', '5.0'];
const EVENT_RESPONSE_TIMES = ['Any', '<1hr', '<4hr', '<24hr'];
const EVENT_EXPERIENCE_LEVELS = ['Any', '1-3yrs', '3-5yrs', '5+yrs'];

const SparkleParticle = ({ delay, left }) => (
  <div
    style={{
      position: 'absolute',
      left: `${left}%`,
      bottom: 0,
      width: '6px',
      height: '6px',
      borderRadius: '999px',
      opacity: 0.8,
      backgroundImage: 'radial-gradient(circle, #FFB42C 0%, #FF8C00 50%, transparent 80%)',
      boxShadow: '0 0 15px rgba(255, 180, 44, 0.9), 0 0 25px rgba(255, 140, 0, 0.5)',
      animation: `sparkleFloat 4s ${delay}s ease-in-out infinite`,
      pointerEvents: 'none'
    }}
  />
);

const generateSparkles = (count = SPARKLE_COUNT) => (
  Array.from({ length: count }).map((_, index) => ({
    id: index,
    delay: Math.random() * 4,
    left: Math.random() * 100
  }))
);

const SPARKLES = generateSparkles();

function HomePageEnhanced() {
  const navigate = useNavigate();
  const locationObj = useLocation();

  const initialFilters = useMemo(
    () => parseFiltersFromSearchParams(new URLSearchParams(locationObj.search)),
    [locationObj.search]
  );

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [activeTab, setActiveTab] = useState('rent'); // 'rent' | 'forsale' | 'eventpro'
  const [showCalendar, setShowCalendar] = useState(false);
  const [rentForm, setRentForm] = useState({
    location: initialFilters.locationLabel || initialFilters.locationText || '',
    startDate: initialFilters.startDate || '',
    endDate: initialFilters.endDate || '',
    category: initialFilters.listingType || '',
    rateMin: '',
    rateMax: '',
    delivery: 'either',
    duration: 'Daily',
    size: '',
    rating: '',
    verified: false,
    insurance: false,
    permits: false
  });
  const [saleForm, setSaleForm] = useState({
    location: initialFilters.locationLabel || initialFilters.locationText || '',
    minPrice: '',
    maxPrice: '',
    category: SALE_CATEGORIES[0].value,
    year: '',
    size: '',
    condition: '',
    equipment: [],
    titleStatus: '',
    serviceHistory: false,
    photoVerified: false,
    financing: false,
    delivery: false
  });
  const [eventForm, setEventForm] = useState({
    eventType: '',
    eventLocation: initialFilters.locationLabel || initialFilters.locationText || '',
    eventDateTime: '',
    serviceCategory: '',
    budgetRange: '',
    guests: '',
    travelIncluded: false,
    instantBooking: false,
    insuranceProvided: false,
    minRating: 'Any',
    responseTime: 'Any',
    experienceLevel: 'Any',
    packages: false,
    addOns: false
  });
  const [advancedOpen, setAdvancedOpen] = useState({
    rent: false,
    forsale: false,
    eventpro: false
  });

  const isEventProMode = activeTab === 'eventpro';

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setFilters((prev) => ({
      ...prev,
      mode:
        tab === 'eventpro'
          ? SEARCH_MODE.EVENT_PRO
          : tab === 'forsale'
            ? SEARCH_MODE.BUY
            : SEARCH_MODE.RENT
    }));
  };

  const handleSearch = (override = {}) => {
    const fallbackLocation = filters.locationLabel || filters.locationText || '';
    const locationValue = override.locationText ?? override.location ?? fallbackLocation;
    const derived = deriveCityState(locationValue || '');
    const nextFilters = {
      ...filters,
      ...override,
      mode: override.mode || filters.mode,
      locationText: locationValue,
      locationLabel: override.locationLabel ?? (locationValue || filters.locationLabel || ''),
      city: override.city ?? derived.city ?? filters.city,
      state: override.state ?? derived.state ?? filters.state,
      startDate: override.startDate !== undefined ? override.startDate : filters.startDate,
      endDate: override.endDate !== undefined ? override.endDate : filters.endDate,
      listingType: override.listingType !== undefined ? override.listingType : filters.listingType,
      page: 1
    };
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    const params = buildSearchParamsFromFilters(nextFilters);
    navigate(`/listings?${params.toString()}`);
  };

  useEffect(() => {
    const baseLocation = initialFilters.locationLabel || initialFilters.locationText || '';
    setRentForm((prev) => ({
      ...prev,
      location: baseLocation,
      startDate: initialFilters.startDate || '',
      endDate: initialFilters.endDate || '',
      category: initialFilters.listingType || prev.category
    }));
    setSaleForm((prev) => ({
      ...prev,
      location: baseLocation
    }));
    setEventForm((prev) => ({
      ...prev,
      eventLocation: baseLocation
    }));
  }, [
    initialFilters.locationLabel,
    initialFilters.locationText,
    initialFilters.startDate,
    initialFilters.endDate,
    initialFilters.listingType
  ]);

  const toggleAdvanced = (tabKey) => {
    setAdvancedOpen((prev) => ({
      ...prev,
      [tabKey]: !prev[tabKey]
    }));
  };

  const setRentField = (field, value) => {
    setRentForm((prev) => ({ ...prev, [field]: value }));
  };

  const setSaleField = (field, value) => {
    setSaleForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSaleEquipment = (option) => {
    setSaleForm((prev) => {
      const exists = prev.equipment.includes(option);
      const equipment = exists
        ? prev.equipment.filter((item) => item !== option)
        : [...prev.equipment, option];
      return { ...prev, equipment };
    });
  };

  const setEventField = (field, value) => {
    setEventForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRentSearch = () => {
    handleSearch({
      mode: SEARCH_MODE.RENT,
      locationText: rentForm.location,
      startDate: rentForm.startDate,
      endDate: rentForm.endDate,
      listingType: rentForm.category
    });
  };

  const handleSaleSearch = () => {
    handleSearch({
      mode: SEARCH_MODE.BUY,
      locationText: saleForm.location,
      listingType: saleForm.category
    });
  };

  const handleEventSearch = () => {
    handleSearch({
      mode: SEARCH_MODE.EVENT_PRO,
      locationText: eventForm.eventLocation,
      startDate: eventForm.eventDateTime ? eventForm.eventDateTime.split('T')[0] : '',
      listingType: eventForm.serviceCategory
    });
  };

  const tabButtons = [
    {
      id: 'rent',
      label: '📅 Rent',
      gradient: 'linear-gradient(135deg, #FF5124 0%, #FF7524 100%)',
      textColor: '#fff',
      shadow: '0 4px 12px rgba(255, 81, 36, 0.3)'
    },
    {
      id: 'forsale',
      label: '💰 For Sale',
      gradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
      textColor: '#fff',
      shadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
    },
    {
      id: 'eventpro',
      label: '✨ Event Pro',
      gradient: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(40,20,0,0.85) 100%)',
      textColor: '#FFB42C',
      shadow: '0 4px 12px rgba(0, 0, 0, 0.5), 0 0 25px rgba(255, 180, 44, 0.3)'
    }
  ];

  const searchCardStyles = isEventProMode
    ? {
        background: 'linear-gradient(135deg, rgba(20,10,0,0.95) 0%, rgba(0,0,0,0.9) 100%)',
        border: '2px solid rgba(255, 180, 44, 0.2)',
        boxShadow: '0 12px 48px rgba(255, 180, 44, 0.3), 0 0 60px rgba(255, 180, 44, 0.2)'
      }
    : {
        background: '#fff',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
      };

  const heroOverlay = isEventProMode
    ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.92) 0%, rgba(40, 20, 0, 0.88) 100%)'
    : 'linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6))';

  const heroBackdrop = isEventProMode
    ? 'url(https://images.unsplash.com/photo-1464047736614-af63643285bf?w=1600&q=80)'
    : 'url(https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=1600&q=80)';

  const eventInputBaseStyles = {
    backgroundColor: '#fff',
    border: '2px solid #e0e0e0',
    color: '#343434'
  };

  const { listings: dynamicListings } = useListings(appliedFilters);

  // Mock featured listings
  const featuredListings = [
    {
      id: 1,
      title: 'Gourmet Food Truck',
      location: 'Phoenix, AZ',
      price: 450,
      priceType: 'day',
      rating: 4.9,
      reviews: 127,
      image: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      title: 'Taco Trailer',
      location: 'Phoenix, AZ',
      price: 350,
      priceType: 'day',
      rating: 4.8,
      reviews: 94,
      image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      title: 'Coffee Cart',
      location: 'Scottsdale, AZ',
      price: 250,
      priceType: 'day',
      rating: 5.0,
      reviews: 203,
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <AppLayout fullWidth contentClassName="bg-white">
      <style>{`
        @media (max-width: 768px) {
          .hero-section {
            height: 600px !important;
          }
          .search-card {
            flex-direction: column !important;
          }
          .tab-button {
            font-size: 14px !important;
            padding: 10px 16px !important;
          }
        }
      `}</style>

      {/* Hero Section */}
      <section
        className="hero-section relative overflow-hidden"
        style={{ minHeight: '720px', backgroundColor: '#050505' }}
      >
        <div className="absolute inset-0">
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: heroBackdrop,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: isEventProMode ? 'saturate(1.1) brightness(0.5)' : 'brightness(0.55)'
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: heroOverlay,
              mixBlendMode: 'multiply'
            }}
          />
        </div>

        {isEventProMode && SPARKLES.map((sparkle) => (
          <SparkleParticle key={sparkle.id} delay={sparkle.delay} left={sparkle.left} />
        ))}

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-16 text-center text-white sm:px-6 lg:px-8 lg:py-24">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200">Three ways to launch</p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Flexible flows for rent, sale, and ✨ event pros
            </h1>
            <p className="mx-auto max-w-2xl text-base text-white/80 sm:text-lg">
              Switch tabs to match the mission: date-based rentals, purchase-ready listings, or sparkling Event Pro services with neutral inputs on a dark stage.
            </p>
          </div>

          <div className="w-full max-w-5xl rounded-[32px] p-6 sm:p-8" style={searchCardStyles}>
            <div className="flex flex-col gap-2 text-sm font-semibold sm:flex-row sm:items-center">
              {tabButtons.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabSwitch(tab.id)}
                    className="tab-button flex-1 rounded-2xl px-5 py-3 transition"
                    style={{
                      background: isActive ? tab.gradient : 'transparent',
                      color: isActive ? tab.textColor : '#666',
                      boxShadow: isActive ? tab.shadow : 'none',
                      transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                      border: isActive ? 'none' : '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 space-y-6 text-left">
              {activeTab === 'rent' && (
                <div className="space-y-6 text-[#343434]">
                  <div className="grid gap-4 md:grid-cols-5">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-[#FF6A1F]">📍 Location</label>
                      <div className="flex items-center gap-3 rounded-2xl border-2 border-[#e0e0e0] bg-white px-4 py-3">
                        <MapPin className="h-5 w-5 text-[#FF5124]" />
                        <input
                          type="text"
                          placeholder="City or region"
                          className="flex-1 bg-transparent text-sm text-[#343434] placeholder:text-[#9b9b9b] focus:outline-none"
                          value={rentForm.location}
                          onChange={(e) => setRentField('location', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-[#FF6A1F]">📅 Start Date</label>
                      <div className="flex items-center gap-3 rounded-2xl border-2 border-[#e0e0e0] bg-white px-4 py-3">
                        <Calendar className="h-5 w-5 text-[#FF5124]" />
                        <input
                          type="date"
                          className="flex-1 bg-transparent text-sm text-[#343434] focus:outline-none"
                          value={rentForm.startDate}
                          onChange={(e) => setRentField('startDate', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-[#FF6A1F]">📅 End Date</label>
                      <div className="flex items-center gap-3 rounded-2xl border-2 border-[#e0e0e0] bg-white px-4 py-3">
                        <Calendar className="h-5 w-5 text-[#FF5124]" />
                        <input
                          type="date"
                          className="flex-1 bg-transparent text-sm text-[#343434] focus:outline-none"
                          value={rentForm.endDate}
                          onChange={(e) => setRentField('endDate', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleRentSearch}
                        className="flex w-full items-center justify-center rounded-2xl px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5"
                        style={{
                          background: 'linear-gradient(135deg, #FF5124 0%, #FF7524 100%)',
                          boxShadow: '0 4px 16px rgba(255, 81, 36, 0.3)'
                        }}
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Search Rentals
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#FF6A1F]">Category Quick-Select</p>
                    <div className="flex flex-wrap gap-2">
                      {RENT_CATEGORIES.map((category) => {
                        const isActive = rentForm.category === category.value;
                        return (
                          <button
                            type="button"
                            key={category.value}
                            onClick={() => setRentField('category', category.value)}
                            className="rounded-full px-4 py-2 text-sm font-semibold transition"
                            style={{
                              background: isActive ? 'linear-gradient(135deg, #FF5124 0%, #FF7524 100%)' : 'rgba(255,255,255,0.7)',
                              color: isActive ? '#fff' : '#343434',
                              boxShadow: isActive ? '0 4px 12px rgba(255, 81, 36, 0.25)' : 'none'
                            }}
                          >
                            {category.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleAdvanced('rent')}
                    className="flex w-full items-center justify-between rounded-2xl border-2 border-[#FFE0D3] bg-[#FFF5EF] px-5 py-3 text-sm font-semibold text-[#FF5124]"
                  >
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Advanced Filters
                    </span>
                    {advancedOpen.rent ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {advancedOpen.rent && (
                    <div className="space-y-4 rounded-2xl border-2 border-[#FFE0D3] bg-white/95 p-4 text-sm text-[#343434]">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#FF6A1F]">💰 Daily Rate Range</p>
                          <div className="mt-2 flex gap-3">
                            <input
                              type="number"
                              placeholder="Min $"
                              className="w-full rounded-xl border-2 border-[#e0e0e0] px-3 py-2 focus:border-[#FF6A1F] focus:outline-none"
                              value={rentForm.rateMin}
                              onChange={(e) => setRentField('rateMin', e.target.value)}
                            />
                            <input
                              type="number"
                              placeholder="Max $"
                              className="w-full rounded-xl border-2 border-[#e0e0e0] px-3 py-2 focus:border-[#FF6A1F] focus:outline-none"
                              value={rentForm.rateMax}
                              onChange={(e) => setRentField('rateMax', e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#FF6A1F]">🚚 Delivery Available</p>
                          <div className="mt-2 flex gap-2">
                            {['yes', 'no', 'either'].map((option) => {
                              const label = option === 'yes' ? 'Yes' : option === 'no' ? 'No' : 'Either';
                              const active = rentForm.delivery === option;
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => setRentField('delivery', option)}
                                  className="flex-1 rounded-xl px-3 py-2 text-sm font-semibold"
                                  style={{
                                    background: active ? 'rgba(255,81,36,0.12)' : 'transparent',
                                    border: `2px solid ${active ? '#FF6A1F' : '#e0e0e0'}`,
                                    color: active ? '#FF6A1F' : '#5c5c5c'
                                  }}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#FF6A1F]">⏰ Rental Duration</p>
                          <select
                            className="mt-2 w-full rounded-xl border-2 border-[#e0e0e0] px-3 py-2 focus:border-[#FF6A1F] focus:outline-none"
                            value={rentForm.duration}
                            onChange={(e) => setRentField('duration', e.target.value)}
                          >
                            {RENT_DURATION_OPTIONS.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#FF6A1F]">📏 Size / Capacity</p>
                          <select
                            className="mt-2 w-full rounded-xl border-2 border-[#e0e0e0] px-3 py-2 focus:border-[#FF6A1F] focus:outline-none"
                            value={rentForm.size}
                            onChange={(e) => setRentField('size', e.target.value)}
                          >
                            <option value="">Any size</option>
                            {RENT_SIZE_OPTIONS.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#FF6A1F]">⭐ Minimum Rating</p>
                          <select
                            className="mt-2 w-full rounded-xl border-2 border-[#e0e0e0] px-3 py-2 focus:border-[#FF6A1F] focus:outline-none"
                            value={rentForm.rating}
                            onChange={(e) => setRentField('rating', e.target.value)}
                          >
                            <option value="">Any</option>
                            {RENT_RATING_OPTIONS.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#343434]">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-[#FF6A1F] text-[#FF6A1F]"
                            checked={rentForm.verified}
                            onChange={(e) => setRentField('verified', e.target.checked)}
                          />
                          ✓ Verified hosts only
                        </label>
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#343434]">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-[#FF6A1F] text-[#FF6A1F]"
                            checked={rentForm.insurance}
                            onChange={(e) => setRentField('insurance', e.target.checked)}
                          />
                          🛡️ Insurance included
                        </label>
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#343434]">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-[#FF6A1F] text-[#FF6A1F]"
                            checked={rentForm.permits}
                            onChange={(e) => setRentField('permits', e.target.checked)}
                          />
                          📜 Permits included
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'forsale' && (
                <div className="space-y-6 text-[#343434]">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-[#2F9E44]">📍 Location</label>
                      <div className="flex items-center gap-3 rounded-2xl border-2 border-[#e0e0e0] bg-white px-4 py-3">
                        <MapPin className="h-5 w-5 text-[#4CAF50]" />
                        <input
                          type="text"
                          placeholder="City or region"
                          className="flex-1 bg-transparent text-sm text-[#343434] placeholder:text-[#9b9b9b] focus:outline-none"
                          value={saleForm.location}
                          onChange={(e) => setSaleField('location', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-[#2F9E44]">💰 Min Price</label>
                      <input
                        type="number"
                        placeholder="$"
                        className="w-full rounded-2xl border-2 border-[#e0e0e0] bg-white px-4 py-3 text-sm text-[#343434] focus:border-[#4CAF50] focus:outline-none"
                        value={saleForm.minPrice}
                        onChange={(e) => setSaleField('minPrice', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-[#2F9E44]">💰 Max Price</label>
                      <input
                        type="number"
                        placeholder="$"
                        className="w-full rounded-2xl border-2 border-[#e0e0e0] bg-white px-4 py-3 text-sm text-[#343434] focus:border-[#4CAF50] focus:outline-none"
                        value={saleForm.maxPrice}
                        onChange={(e) => setSaleField('maxPrice', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SALE_CATEGORIES.map((category) => {
                      const isActive = saleForm.category === category.value;
                      return (
                        <button
                          type="button"
                          key={category.value}
                          onClick={() => setSaleField('category', category.value)}
                          className="rounded-full px-4 py-2 text-sm font-semibold transition"
                          style={{
                            background: isActive ? 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' : 'rgba(255,255,255,0.85)',
                            color: isActive ? '#fff' : '#343434',
                            boxShadow: isActive ? '0 4px 12px rgba(76, 175, 80, 0.25)' : 'none'
                          }}
                        >
                          {category.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="md:col-span-3">
                      <button
                        type="button"
                        onClick={() => toggleAdvanced('forsale')}
                        className="flex w-full items-center justify-between rounded-2xl border-2 border-[#D1F2D3] bg-[#F3FFF4] px-5 py-3 text-sm font-semibold text-[#2F9E44]"
                      >
                        <span className="flex items-center gap-2">
                          <SlidersHorizontal className="h-4 w-4" />
                          Advanced Filters
                        </span>
                        {advancedOpen.forsale ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleSaleSearch}
                        className="flex w-full items-center justify-center rounded-2xl px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5"
                        style={{
                          background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                          boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)'
                        }}
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Search Listings
                      </button>
                    </div>
                  </div>
                  {advancedOpen.forsale && (
                    <div className="space-y-4 rounded-2xl border-2 border-[#D1F2D3] bg-white/95 p-4 text-sm text-[#343434]">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#2F9E44]">📅 Year</p>
                          <select
                            className="mt-2 w-full rounded-xl border-2 border-[#e0e0e0] px-3 py-2 focus:border-[#2F9E44] focus:outline-none"
                            value={saleForm.year}
                            onChange={(e) => setSaleField('year', e.target.value)}
                          >
                            <option value="">Any year</option>
                            {SALE_YEAR_OPTIONS.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#2F9E44]">📏 Size / Type</p>
                          <select
                            className="mt-2 w-full rounded-xl border-2 border-[#e0e0e0] px-3 py-2 focus:border-[#2F9E44] focus:outline-none"
                            value={saleForm.size}
                            onChange={(e) => setSaleField('size', e.target.value)}
                          >
                            <option value="">Any type</option>
                            {SALE_SIZE_OPTIONS.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#2F9E44]">⚙️ Condition</p>
                          <select
                            className="mt-2 w-full rounded-xl border-2 border-[#e0e0e0] px-3 py-2 focus:border-[#2F9E44] focus:outline-none"
                            value={saleForm.condition}
                            onChange={(e) => setSaleField('condition', e.target.value)}
                          >
                            <option value="">Any condition</option>
                            {SALE_CONDITIONS.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#2F9E44]">🔧 Equipment Included</p>
                        <div className="mt-2 grid gap-2 md:grid-cols-2">
                          {SALE_EQUIPMENT_OPTIONS.map((option) => (
                            <label key={option} className="flex items-center gap-2 text-sm font-semibold text-[#343434]">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-[#2F9E44] text-[#2F9E44]"
                                checked={saleForm.equipment.includes(option)}
                                onChange={() => toggleSaleEquipment(option)}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#2F9E44]">📜 Title Status</p>
                          <select
                            className="mt-2 w-full rounded-xl border-2 border-[#e0e0e0] px-3 py-2 focus:border-[#2F9E44] focus:outline-none"
                            value={saleForm.titleStatus}
                            onChange={(e) => setSaleField('titleStatus', e.target.value)}
                          >
                            <option value="">Any</option>
                            {SALE_TITLE_OPTIONS.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid gap-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-[#343434]">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-[#2F9E44] text-[#2F9E44]"
                              checked={saleForm.serviceHistory}
                              onChange={(e) => setSaleField('serviceHistory', e.target.checked)}
                            />
                            🛠️ Service history available
                          </label>
                          <label className="flex items-center gap-2 text-sm font-semibold text-[#343434]">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-[#2F9E44] text-[#2F9E44]"
                              checked={saleForm.photoVerified}
                              onChange={(e) => setSaleField('photoVerified', e.target.checked)}
                            />
                            📸 Photo verification
                          </label>
                          <label className="flex items-center gap-2 text-sm font-semibold text-[#343434]">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-[#2F9E44] text-[#2F9E44]"
                              checked={saleForm.financing}
                              onChange={(e) => setSaleField('financing', e.target.checked)}
                            />
                            💳 Financing available
                          </label>
                          <label className="flex items-center gap-2 text-sm font-semibold text-[#343434]">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-[#2F9E44] text-[#2F9E44]"
                              checked={saleForm.delivery}
                              onChange={(e) => setSaleField('delivery', e.target.checked)}
                            />
                            🚛 Delivery available
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'eventpro' && (
                <div className="space-y-6 text-white">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-[#FFB42C]">⚡ Event Type</label>
                      <select
                        className="w-full rounded-2xl px-4 py-3 text-sm focus:border-[#FFB42C] focus:outline-none"
                        style={eventInputBaseStyles}
                        value={eventForm.eventType}
                        onChange={(e) => setEventField('eventType', e.target.value)}
                      >
                        <option value="">Select event type</option>
                        {EVENT_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-[#FFB42C]">📍 Event Location</label>
                      <input
                        type="text"
                        placeholder="City, venue, or coordinates"
                        className="w-full rounded-2xl px-4 py-3 text-sm focus:border-[#FFB42C] focus:outline-none"
                        style={eventInputBaseStyles}
                        value={eventForm.eventLocation}
                        onChange={(e) => setEventField('eventLocation', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-[#FFB42C]">📅 Event Date & Time</label>
                      <input
                        type="datetime-local"
                        className="w-full rounded-2xl px-4 py-3 text-sm focus:border-[#FFB42C] focus:outline-none"
                        style={eventInputBaseStyles}
                        value={eventForm.eventDateTime}
                        onChange={(e) => setEventField('eventDateTime', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-[#FFB42C]">🍽️ Service Category</label>
                      <select
                        className="w-full rounded-2xl px-4 py-3 text-sm focus:border-[#FFB42C] focus:outline-none"
                        style={eventInputBaseStyles}
                        value={eventForm.serviceCategory}
                        onChange={(e) => setEventField('serviceCategory', e.target.value)}
                      >
                        <option value="">Select service</option>
                        {SERVICE_CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-[#FFB42C]">💰 Budget Range</label>
                      <input
                        type="text"
                        placeholder="$1,500 - $5,000"
                        className="w-full rounded-2xl px-4 py-3 text-sm focus:border-[#FFB42C] focus:outline-none"
                        style={eventInputBaseStyles}
                        value={eventForm.budgetRange}
                        onChange={(e) => setEventField('budgetRange', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-[#FFB42C]">👥 Expected Guests</label>
                      <input
                        type="number"
                        placeholder="e.g., 150"
                        className="w-full rounded-2xl px-4 py-3 text-sm focus:border-[#FFB42C] focus:outline-none"
                        style={eventInputBaseStyles}
                        value={eventForm.guests}
                        onChange={(e) => setEventField('guests', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="button"
                        onClick={handleEventSearch}
                        className="flex w-full items-center justify-center rounded-2xl px-6 py-4 text-base font-bold text-black transition hover:-translate-y-1"
                        style={{
                          background: 'linear-gradient(135deg, #FFB42C 0%, #FF8C00 100%)',
                          boxShadow: '0 6px 24px rgba(255, 180, 44, 0.5), 0 0 40px rgba(255, 180, 44, 0.3)'
                        }}
                      >
                        <Search className="mr-2 h-5 w-5" />
                        Search Event Pros
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAdvanced('eventpro')}
                    className="flex w-full items-center justify-between rounded-2xl border border-[#FFB42C]/40 bg-black/30 px-5 py-3 text-sm font-semibold text-[#FFB42C]"
                  >
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Advanced Filters
                    </span>
                    {advancedOpen.eventpro ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {advancedOpen.eventpro && (
                    <div className="grid gap-4 rounded-2xl border border-[#FFB42C]/30 bg-black/50 p-4 text-sm text-white md:grid-cols-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-white">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-[#FFB42C] text-[#FFB42C]"
                          checked={eventForm.travelIncluded}
                          onChange={(e) => setEventField('travelIncluded', e.target.checked)}
                        />
                        🚗 Travel included
                      </label>
                      <label className="flex items-center gap-2 text-sm font-semibold text-white">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-[#FFB42C] text-[#FFB42C]"
                          checked={eventForm.instantBooking}
                          onChange={(e) => setEventField('instantBooking', e.target.checked)}
                        />
                        ⚡ Instant booking
                      </label>
                      <label className="flex items-center gap-2 text-sm font-semibold text-white">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-[#FFB42C] text-[#FFB42C]"
                          checked={eventForm.insuranceProvided}
                          onChange={(e) => setEventField('insuranceProvided', e.target.checked)}
                        />
                        🛡️ Insurance provided
                      </label>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#FFB42C]">⭐ Minimum rating</p>
                        <select
                          className="mt-2 w-full rounded-xl px-3 py-2 text-sm text-[#343434] focus:border-[#FFB42C] focus:outline-none"
                          style={eventInputBaseStyles}
                          value={eventForm.minRating}
                          onChange={(e) => setEventField('minRating', e.target.value)}
                        >
                          {EVENT_MIN_RATINGS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#FFB42C]">⏱️ Response time</p>
                        <select
                          className="mt-2 w-full rounded-xl px-3 py-2 text-sm text-[#343434] focus:border-[#FFB42C] focus:outline-none"
                          style={eventInputBaseStyles}
                          value={eventForm.responseTime}
                          onChange={(e) => setEventField('responseTime', e.target.value)}
                        >
                          {EVENT_RESPONSE_TIMES.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#FFB42C]">👔 Experience level</p>
                        <select
                          className="mt-2 w-full rounded-xl px-3 py-2 text-sm text-[#343434] focus:border-[#FFB42C] focus:outline-none"
                          style={eventInputBaseStyles}
                          value={eventForm.experienceLevel}
                          onChange={(e) => setEventField('experienceLevel', e.target.value)}
                        >
                          {EVENT_EXPERIENCE_LEVELS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-white">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-[#FFB42C] text-[#FFB42C]"
                          checked={eventForm.packages}
                          onChange={(e) => setEventField('packages', e.target.checked)}
                        />
                        📦 Package deals available
                      </label>
                      <label className="flex items-center gap-2 text-sm font-semibold text-white">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-[#FFB42C] text-[#FFB42C]"
                          checked={eventForm.addOns}
                          onChange={(e) => setEventField('addOns', e.target.checked)}
                        />
                        ➕ Add-ons available
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section style={{ background: '#F8F8F8', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px', color: '#343434' }}>
            Why Choose Vendibook?
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '60px' }}>
            The trusted marketplace connecting mobile businesses and event professionals
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#FF5124',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                color: 'white'
              }}>
                <CheckCircle style={{ width: '40px', height: '40px' }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#343434' }}>
                Verified Hosts
              </h3>
              <p style={{ fontSize: '15px', color: 'rgba(52, 52, 52, 0.65)', lineHeight: '1.6' }}>
                Every host is background-checked and equipment is inspected for safety and quality
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#FFB42C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                color: 'white'
              }}>
                <Star style={{ width: '40px', height: '40px' }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#343434' }}>
                Trusted Reviews
              </h3>
              <p style={{ fontSize: '15px', color: 'rgba(52, 52, 52, 0.65)', lineHeight: '1.6' }}>
                Read authentic reviews from real customers to make informed decisions
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#343434',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                color: 'white'
              }}>
                <Shield style={{ width: '40px', height: '40px' }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#343434' }}>
                Secure Booking
              </h3>
              <p style={{ fontSize: '15px', color: 'rgba(52, 52, 52, 0.65)', lineHeight: '1.6' }}>
                Payment protection and insurance coverage for peace of mind
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section style={{ padding: '80px 40px', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '16px', color: '#343434' }}>
            Featured Near You
          </h2>
          <p style={{ fontSize: '18px', textAlign: 'center', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '60px' }}>
            Top-rated mobile businesses in your area
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {featuredListings.map(listing => (
              <div key={listing.id} style={{ cursor: 'pointer', transition: 'transform 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  marginBottom: '16px',
                  aspectRatio: '16/10'
                }}>
                  <img
                    src={listing.image}
                    alt={listing.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#343434' }}>
                  {listing.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Star style={{ width: '16px', height: '16px', fill: '#FF5124', color: '#FF5124' }} />
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{listing.rating}</span>
                  <span style={{ fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)' }}>({listing.reviews} reviews)</span>
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px' }}>
                  📍 {listing.location}
                </p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#343434' }}>
                  ${listing.price} <span style={{ fontWeight: '400', fontSize: '14px' }}>/ {listing.priceType}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#343434', color: 'white', padding: '60px 40px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck style={{ width: '28px', height: '28px' }} /> Vendibook
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                The mobile business marketplace connecting hosts, renters, and event professionals.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Browse</h4>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px', textDecoration: 'none' }}>Food Trucks</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px', textDecoration: 'none' }}>Trailers</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px', textDecoration: 'none' }}>Ghost Kitchens</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px', textDecoration: 'none' }}>Event Pros</a>
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Hosting</h4>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px', textDecoration: 'none' }}>List Your Business</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px', textDecoration: 'none' }}>Host Resources</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px', textDecoration: 'none' }}>Protection</a>
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Company</h4>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px', textDecoration: 'none' }}>About</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px', textDecoration: 'none' }}>Careers</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px', textDecoration: 'none' }}>Support</a>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
              © 2025 Vendibook LLC · All rights reserved
            </p>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="#" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Privacy</a>
              <a href="#" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Terms</a>
              <a href="#" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </AppLayout>
  );
}

export default HomePageEnhanced;
