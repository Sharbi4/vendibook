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
  UtensilsCrossed,
  CheckCircle,
  Shield,
  Clock
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

// Generate sparkle particles
const generateSparkles = () => {
  const sparkles = [];
  for (let i = 0; i < 30; i++) {
    sparkles.push({
      id: i,
      delay: Math.random() * 3,
      left: Math.random() * 100,
      size: 2 + Math.random() * 3
    });
  }
  return sparkles;
};

const SPARKLES = generateSparkles();

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

function HomePageEnhanced() {
  const navigate = useNavigate();
  const locationObj = useLocation();

  const initialFilters = useMemo(
    () => parseFiltersFromSearchParams(new URLSearchParams(locationObj.search)),
    [locationObj.search]
  );

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [activeTab, setActiveTab] = useState('rent'); // 'rent' or 'event-pro'
  const [showCalendar, setShowCalendar] = useState(false);
  const [eventFilters, setEventFilters] = useState({
    eventType: '',
    eventLocation: '',
    eventDateTime: '',
    serviceCategory: '',
    priceRange: '',
    crowdSize: ''
  });

  // Determine if Event Pro mode is active
  const isEventProMode = activeTab === 'event-pro' || appliedFilters.mode === SEARCH_MODE.EVENT_PRO;

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'event-pro') {
      setFilters(prev => ({ ...prev, mode: SEARCH_MODE.EVENT_PRO }));
    } else {
      setFilters(prev => ({ ...prev, mode: SEARCH_MODE.RENT }));
    }
  };

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
    navigate(`/listings?${params.toString()}`);
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

      {/* Hero Section with Video Background */}
      <section
        className="hero-section relative overflow-hidden"
        style={{
          height: '700px',
          background: isEventProMode
            ? 'linear-gradient(135deg, #000000 0%, #191970 50%, #4B0082 100%)'
            : 'linear-gradient(135deg, rgba(3,7,18,0.95), rgba(15,23,42,0.75))',
          transition: 'background 0.8s ease'
        }}
      >
        {/* Video Background Placeholder */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0
        }}>
          {/* Replace this with your video element */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: isEventProMode
              ? 'url(https://images.unsplash.com/photo-1464047736614-af63643285bf?w=1600&q=80) center/cover'
              : 'url(https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=1600&q=80) center/cover',
            opacity: 0.3,
            transition: 'opacity 0.8s ease'
          }} />
        </div>

        {/* Sparkle Particles for Event Pro Mode */}
        {isEventProMode && SPARKLES.map(sparkle => (
          <SparkleParticle
            key={sparkle.id}
            delay={sparkle.delay}
            left={sparkle.left}
            size={sparkle.size}
          />
        ))}

        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-4 text-center text-white sm:px-6 lg:px-8">
          <h1 className="mb-4 text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Rent, Sell, or Book—
          </h1>
          <p className="mb-8 text-xl sm:text-2xl" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Vendibook, the mobile business marketplace
          </p>
          <p className="mb-12 max-w-2xl text-base sm:text-lg" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Connect with food trucks, trailers, ghost kitchens, event pros, and vendor markets. Your next activation starts here.
          </p>

          {/* Tabbed Search Card */}
          <div className="search-card w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl backdrop-blur">
            {/* Tabs */}
            <div className="mb-6 flex gap-2">
              <button
                type="button"
                onClick={() => handleTabSwitch('rent')}
                className="tab-button flex-1 rounded-2xl px-6 py-3 text-sm font-semibold transition"
                style={{
                  background: activeTab === 'rent' ? '#FF5124' : 'transparent',
                  color: activeTab === 'rent' ? 'white' : '#343434',
                  border: activeTab === 'rent' ? 'none' : '1px solid #E5E7EB'
                }}
              >
                Rent or For Sale
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('event-pro')}
                className="tab-button flex-1 rounded-2xl px-6 py-3 text-sm font-semibold transition"
                style={{
                  background: activeTab === 'event-pro' ? '#191970' : 'transparent',
                  color: activeTab === 'event-pro' ? 'white' : '#343434',
                  border: activeTab === 'event-pro' ? 'none' : '1px solid #E5E7EB'
                }}
              >
                Book an Event Pro
              </button>
            </div>

            {/* Search Fields */}
            {activeTab === 'rent' ? (
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Where to?"
                      className="flex-1 border-none bg-transparent text-sm outline-none"
                      value={filters.locationText || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, locationText: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      placeholder="When?"
                      className="flex-1 border-none bg-transparent text-sm outline-none"
                      value={filters.startDate || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
                >
                  <Search className="inline-block mr-2 h-4 w-4" />
                  Search
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    ⚡ Event Type
                  </label>
                  <select
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none"
                    value={eventFilters.eventType}
                    onChange={(e) => setEventFilters(prev => ({ ...prev, eventType: e.target.value }))}
                  >
                    <option value="">Select event type</option>
                    {EVENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    📍 Event Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter event location"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none"
                    value={eventFilters.eventLocation}
                    onChange={(e) => setEventFilters(prev => ({ ...prev, eventLocation: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    📅 Event Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none"
                    value={eventFilters.eventDateTime}
                    onChange={(e) => setEventFilters(prev => ({ ...prev, eventDateTime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    🍴 Service Category
                  </label>
                  <select
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none"
                    value={eventFilters.serviceCategory}
                    onChange={(e) => setEventFilters(prev => ({ ...prev, serviceCategory: e.target.value }))}
                  >
                    <option value="">Select service</option>
                    {SERVICE_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    💵 Price Range
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., $500 - $2000"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none"
                    value={eventFilters.priceRange}
                    onChange={(e) => setEventFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    👥 Expected Crowd Size
                  </label>
                  <input
                    type="number"
                    placeholder="Number of guests"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none"
                    value={eventFilters.crowdSize}
                    onChange={(e) => setEventFilters(prev => ({ ...prev, crowdSize: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:shadow-xl"
                  >
                    <Search className="inline-block mr-2 h-5 w-5" />
                    Search Event Pros
                  </button>
                </div>
              </div>
            )}
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
