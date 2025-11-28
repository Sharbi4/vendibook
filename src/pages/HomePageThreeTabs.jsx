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
  DollarSign
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';
import LocationAutocomplete from '../components/LocationAutocomplete.jsx';
import {
  RENT_ADVANCED_FILTERS,
  FOR_SALE_ADVANCED_FILTERS,
  EVENT_PRO_ADVANCED_FILTERS,
  EVENT_TYPES,
  SERVICE_CATEGORIES,
  SEARCH_MODE,
  buildSearchParamsFromFilters,
  deriveCityState,
  formatDateRange,
  getCategoryOptionsForMode,
  parseFiltersFromSearchParams
} from '../constants/filters';

// Enhanced Sparkle Particle Component (50 particles, 6px, MORE PROMINENT)
const EnhancedSparkleParticle = ({ delay, left, size }) => (
  <div
    style={{
      position: 'absolute',
      left: `${left}%`,
      bottom: '0',
      width: `${size}px`,
      height: `${size}px`,
      background: 'radial-gradient(circle, #FFB42C 0%, #FF8C00 50%, transparent 80%)',
      borderRadius: '50%',
      opacity: 0,
      animation: `sparkleFloat 4s ${delay}s ease-in-out infinite`,
      boxShadow: '0 0 15px rgba(255, 180, 44, 0.9), 0 0 25px rgba(255, 140, 0, 0.5)',
      pointerEvents: 'none'
    }}
  />
);

// Generate 50 sparkles with 6px size
const generateSparkles = () => {
  const sparkles = [];
  for (let i = 0; i < 50; i++) {
    sparkles.push({
      id: i,
      delay: Math.random() * 4,
      left: Math.random() * 100,
      size: 6 // Fixed 6px size
    });
  }
  return sparkles;
};

const SPARKLES = generateSparkles();

function HomePageThreeTabs() {
  const navigate = useNavigate();
  const locationObj = useLocation();

  const initialFilters = useMemo(
    () => parseFiltersFromSearchParams(new URLSearchParams(locationObj.search)),
    [locationObj.search]
  );

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [activeTab, setActiveTab] = useState('rent'); // 'rent', 'for-sale', 'event-pro'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Tab-specific filter states
  const [rentFilters, setRentFilters] = useState({
    location: '',
    startDate: '',
    endDate: ''
  });

  const [forSaleFilters, setForSaleFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: ''
  });

  const [eventProFilters, setEventProFilters] = useState({
    eventType: '',
    eventLocation: '',
    eventDateTime: '',
    serviceCategory: '',
    budgetRange: '',
    expectedGuests: ''
  });

  const isEventProMode = activeTab === 'event-pro';

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setShowAdvancedFilters(false);
    
    if (tab === 'rent') {
      setFilters(prev => ({ ...prev, mode: SEARCH_MODE.RENT }));
    } else if (tab === 'for-sale') {
      setFilters(prev => ({ ...prev, mode: SEARCH_MODE.FOR_SALE }));
    } else if (tab === 'event-pro') {
      setFilters(prev => ({ ...prev, mode: SEARCH_MODE.EVENT_PRO }));
    }
  };

  const handleSearch = () => {
    let searchParams;
    
    if (activeTab === 'rent') {
      searchParams = buildSearchParamsFromFilters({
        ...filters,
        mode: SEARCH_MODE.RENT,
        locationText: rentFilters.location,
        startDate: rentFilters.startDate,
        endDate: rentFilters.endDate
      });
    } else if (activeTab === 'for-sale') {
      searchParams = buildSearchParamsFromFilters({
        ...filters,
        mode: SEARCH_MODE.FOR_SALE,
        locationText: forSaleFilters.location,
        minPrice: forSaleFilters.minPrice,
        maxPrice: forSaleFilters.maxPrice
      });
    } else if (activeTab === 'event-pro') {
      searchParams = buildSearchParamsFromFilters({
        ...filters,
        mode: SEARCH_MODE.EVENT_PRO,
        ...eventProFilters
      });
    }
    
    navigate(`/listings?${searchParams.toString()}`);
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

  // Get current advanced filters based on active tab
  const currentAdvancedFilters = activeTab === 'rent' 
    ? RENT_ADVANCED_FILTERS 
    : activeTab === 'for-sale' 
    ? FOR_SALE_ADVANCED_FILTERS 
    : EVENT_PRO_ADVANCED_FILTERS;

  // Tab styling configurations
  const getTabStyle = (tab) => {
    const isActive = activeTab === tab;
    
    if (tab === 'rent') {
      return {
        background: isActive 
          ? 'linear-gradient(135deg, #FF5124 0%, #FF7524 100%)' 
          : 'transparent',
        color: isActive ? '#fff' : '#666',
        boxShadow: isActive 
          ? '0 4px 12px rgba(255, 81, 36, 0.3)' 
          : 'none',
        transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
        border: isActive ? 'none' : '1px solid #e0e0e0'
      };
    } else if (tab === 'for-sale') {
      return {
        background: isActive 
          ? 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' 
          : 'transparent',
        color: isActive ? '#fff' : '#666',
        boxShadow: isActive 
          ? '0 4px 12px rgba(76, 175, 80, 0.3)' 
          : 'none',
        transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
        border: isActive ? 'none' : '1px solid #e0e0e0'
      };
    } else if (tab === 'event-pro') {
      return {
        background: isActive 
          ? 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(40,20,0,0.85) 100%)' 
          : 'transparent',
        color: isActive ? '#FFB42C' : '#666',
        boxShadow: isActive 
          ? '0 4px 12px rgba(0, 0, 0, 0.5), 0 0 25px rgba(255, 180, 44, 0.3)' 
          : 'none',
        transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
        border: isActive ? 'none' : '1px solid #e0e0e0'
      };
    }
  };

  // Search card styling
  const getSearchCardStyle = () => {
    if (activeTab === 'event-pro') {
      return {
        background: 'linear-gradient(135deg, rgba(20,10,0,0.95) 0%, rgba(0,0,0,0.9) 100%)',
        border: '2px solid rgba(255, 180, 44, 0.2)',
        boxShadow: '0 12px 48px rgba(255, 180, 44, 0.3), 0 0 60px rgba(255, 180, 44, 0.2)'
      };
    } else {
      return {
        background: '#fff',
        border: 'none',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
      };
    }
  };

  // Search button styling
  const getSearchButtonStyle = () => {
    if (activeTab === 'rent') {
      return {
        background: 'linear-gradient(135deg, #FF5124 0%, #FF7524 100%)',
        color: '#fff',
        boxShadow: '0 4px 16px rgba(255, 81, 36, 0.3)'
      };
    } else if (activeTab === 'for-sale') {
      return {
        background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
        color: '#fff',
        boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)'
      };
    } else if (activeTab === 'event-pro') {
      return {
        background: 'linear-gradient(135deg, #FFB42C 0%, #FF8C00 100%)',
        color: '#000',
        fontWeight: '700',
        boxShadow: '0 6px 24px rgba(255, 180, 44, 0.5), 0 0 40px rgba(255, 180, 44, 0.3)'
      };
    }
  };

  // Hero background styling
  const getHeroBackgroundStyle = () => {
    if (activeTab === 'event-pro') {
      return {
        background: 'linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(40,20,0,0.88) 100%)',
        transition: 'background 0.8s ease'
      };
    } else {
      return {
        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6))',
        transition: 'background 0.8s ease'
      };
    }
  };

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
        
        .search-button:hover {
          transform: translateY(-2px);
        }
        
        .search-button-event-pro:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 28px rgba(255, 180, 44, 0.6), 0 0 50px rgba(255, 180, 44, 0.4) !important;
        }
      `}</style>

      {/* Hero Section with Three-Tab System */}
      <section
        className="hero-section relative overflow-hidden"
        style={{
          height: '700px',
          position: 'relative'
        }}
      >
        {/* Video Background with Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0
        }}>
          {/* Video placeholder - replace with actual video */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'url(https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=1600&q=80) center/cover',
            opacity: 0.3
          }} />
          
          {/* Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            ...getHeroBackgroundStyle()
          }} />
        </div>

        {/* Enhanced Sparkles for Event Pro Mode (50 particles, 6px) */}
        {isEventProMode && SPARKLES.map(sparkle => (
          <EnhancedSparkleParticle
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

          {/* Three-Tab Search Card */}
          <div 
            className="search-card w-full max-w-5xl rounded-3xl p-6 shadow-2xl backdrop-blur"
            style={getSearchCardStyle()}
          >
            {/* Tab Buttons */}
            <div className="mb-6 flex gap-3">
              <button
                type="button"
                onClick={() => handleTabSwitch('rent')}
                className="tab-button flex-1 rounded-2xl px-6 py-3 text-sm font-semibold transition-all"
                style={getTabStyle('rent')}
              >
                📅 RENT
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('for-sale')}
                className="tab-button flex-1 rounded-2xl px-6 py-3 text-sm font-semibold transition-all"
                style={getTabStyle('for-sale')}
              >
                💰 FOR SALE
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch('event-pro')}
                className="tab-button flex-1 rounded-2xl px-6 py-3 text-sm font-semibold transition-all"
                style={getTabStyle('event-pro')}
              >
                ✨ EVENT PRO
              </button>
            </div>

            {/* RENT TAB CONTENT */}
            {activeTab === 'rent' && (
              <div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#666' }}>
                      📍 Location
                    </label>
                    <input
                      type="text"
                      placeholder="Enter city & state"
                      className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                      style={{
                        background: '#fff',
                        border: '2px solid #e0e0e0',
                        color: '#343434'
                      }}
                      value={rentFilters.location}
                      onChange={(e) => setRentFilters(prev => ({ ...prev, location: e.target.value }))}
                      onFocus={(e) => e.target.style.borderColor = '#FF5124'}
                      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#666' }}>
                      📅 Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                      style={{
                        background: '#fff',
                        border: '2px solid #e0e0e0',
                        color: '#343434'
                      }}
                      value={rentFilters.startDate}
                      onChange={(e) => setRentFilters(prev => ({ ...prev, startDate: e.target.value }))}
                      onFocus={(e) => e.target.style.borderColor = '#FF5124'}
                      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#666' }}>
                      📅 End Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                      style={{
                        background: '#fff',
                        border: '2px solid #e0e0e0',
                        color: '#343434'
                      }}
                      value={rentFilters.endDate}
                      onChange={(e) => setRentFilters(prev => ({ ...prev, endDate: e.target.value }))}
                      onFocus={(e) => e.target.style.borderColor = '#FF5124'}
                      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                  </div>
                </div>

                {/* Category Quick-Select */}
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {['🚚 Food Trucks', '🎪 Trailers', '🍴 Ghost Kitchens', '📍 Vending Lots', '⚙️ Equipment'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className="rounded-full border px-4 py-2 text-xs font-semibold transition"
                        style={{
                          border: '1px solid #e0e0e0',
                          background: '#f8f8f8',
                          color: '#343434'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="search-button w-full rounded-2xl px-8 py-4 text-base font-semibold transition-all"
                    style={getSearchButtonStyle()}
                  >
                    <Search className="inline-block mr-2 h-5 w-5" />
                    Search Rentals
                  </button>
                </div>
              </div>
            )}

            {/* FOR SALE TAB CONTENT */}
            {activeTab === 'for-sale' && (
              <div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#666' }}>
                      📍 Location
                    </label>
                    <input
                      type="text"
                      placeholder="Enter city & state"
                      className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                      style={{
                        background: '#fff',
                        border: '2px solid #e0e0e0',
                        color: '#343434'
                      }}
                      value={forSaleFilters.location}
                      onChange={(e) => setForSaleFilters(prev => ({ ...prev, location: e.target.value }))}
                      onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#666' }}>
                      💰 Min Price
                    </label>
                    <input
                      type="number"
                      placeholder="$0"
                      className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                      style={{
                        background: '#fff',
                        border: '2px solid #e0e0e0',
                        color: '#343434'
                      }}
                      value={forSaleFilters.minPrice}
                      onChange={(e) => setForSaleFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                      onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#666' }}>
                      💰 Max Price
                    </label>
                    <input
                      type="number"
                      placeholder="$100,000"
                      className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                      style={{
                        background: '#fff',
                        border: '2px solid #e0e0e0',
                        color: '#343434'
                      }}
                      value={forSaleFilters.maxPrice}
                      onChange={(e) => setForSaleFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                      onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                  </div>
                </div>

                {/* Category Quick-Select */}
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {['🚚 Food Trucks', '🎪 Trailers', '🍴 Ghost Kitchen Equipment', '📍 Vending Machines', '⚙️ Commercial Equipment'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className="rounded-full border px-4 py-2 text-xs font-semibold transition"
                        style={{
                          border: '1px solid #e0e0e0',
                          background: '#f8f8f8',
                          color: '#343434'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="search-button w-full rounded-2xl px-8 py-4 text-base font-semibold transition-all"
                    style={getSearchButtonStyle()}
                  >
                    <Search className="inline-block mr-2 h-5 w-5" />
                    Search For Sale
                  </button>
                </div>
              </div>
            )}

            {/* EVENT PRO TAB CONTENT */}
            {activeTab === 'event-pro' && (
              <div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: isEventProMode ? 'rgba(255,180,44,0.9)' : '#666' }}>
                      ⚡ Event Type
                    </label>
                    <select
                      className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                      style={{
                        background: '#fff',
                        border: '2px solid #e0e0e0',
                        color: '#343434'
                      }}
                      value={eventProFilters.eventType}
                      onChange={(e) => setEventProFilters(prev => ({ ...prev, eventType: e.target.value }))}
                      onFocus={(e) => e.target.style.borderColor = '#FFB42C'}
                      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    >
                      <option value="">Select event type</option>
                      {EVENT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: isEventProMode ? 'rgba(255,180,44,0.9)' : '#666' }}>
                      📍 Event Location
                    </label>
                    <input
                      type="text"
                      placeholder="Enter event location"
                      className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                      style={{
                        background: '#fff',
                        border: '2px solid #e0e0e0',
                        color: '#343434'
                      }}
                      value={eventProFilters.eventLocation}
                      onChange={(e) => setEventProFilters(prev => ({ ...prev, eventLocation: e.target.value }))}
                      onFocus={(e) => e.target.style.borderColor = '#FFB42C'}
                      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: isEventProMode ? 'rgba(255,180,44,0.9)' : '#666' }}>
                      📅 Event Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                      style={{
                        background: '#fff',
                        border: '2px solid #e0e0e0',
                        color: '#343434'
                      }}
                      value={eventProFilters.eventDateTime}
                      onChange={(e) => setEventProFilters(prev => ({ ...prev, eventDateTime: e.target.value }))}
                      onFocus={(e) => e.target.style.borderColor = '#FFB42C'}
                      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: isEventProMode ? 'rgba(255,180,44,0.9)' : '#666' }}>
                      🍽️ Service Category
                    </label>
                    <select
                      className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                      style={{
                        background: '#fff',
                        border: '2px solid #e0e0e0',
                        color: '#343434'
                      }}
                      value={eventProFilters.serviceCategory}
                      onChange={(e) => setEventProFilters(prev => ({ ...prev, serviceCategory: e.target.value }))}
                      onFocus={(e) => e.target.style.borderColor = '#FFB42C'}
                      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    >
                      <option value="">Select service</option>
                      {SERVICE_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: isEventProMode ? 'rgba(255,180,44,0.9)' : '#666' }}>
                      💰 Budget Range
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., $500 - $2000"
                      className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                      style={{
                        background: '#fff',
                        border: '2px solid #e0e0e0',
                        color: '#343434'
                      }}
                      value={eventProFilters.budgetRange}
                      onChange={(e) => setEventProFilters(prev => ({ ...prev, budgetRange: e.target.value }))}
                      onFocus={(e) => e.target.style.borderColor = '#FFB42C'}
                      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: isEventProMode ? 'rgba(255,180,44,0.9)' : '#666' }}>
                      👥 Expected Guests
                    </label>
                    <input
                      type="number"
                      placeholder="Number of guests"
                      className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                      style={{
                        background: '#fff',
                        border: '2px solid #e0e0e0',
                        color: '#343434'
                      }}
                      value={eventProFilters.expectedGuests}
                      onChange={(e) => setEventProFilters(prev => ({ ...prev, expectedGuests: e.target.value }))}
                      onFocus={(e) => e.target.style.borderColor = '#FFB42C'}
                      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="search-button search-button-event-pro w-full rounded-2xl px-8 py-4 text-base font-semibold transition-all"
                    style={getSearchButtonStyle()}
                  >
                    <Search className="inline-block mr-2 h-5 w-5" />
                    Search Event Pros
                  </button>
                </div>
              </div>
            )}

            {/* Advanced Filters (Collapsible) */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex w-full items-center justify-between rounded-2xl border border-dashed px-5 py-3 text-sm font-semibold transition"
                style={{
                  borderColor: isEventProMode ? 'rgba(255, 180, 44, 0.3)' : '#e0e0e0',
                  background: isEventProMode ? 'rgba(255, 180, 44, 0.05)' : '#f8f8f8',
                  color: isEventProMode ? '#FFB42C' : '#666'
                }}
              >
                Advanced Filters
                {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showAdvancedFilters && (
                <div className="mt-4 space-y-3 rounded-2xl border p-4" style={{
                  borderColor: isEventProMode ? 'rgba(255, 180, 44, 0.2)' : '#e0e0e0',
                  background: isEventProMode ? 'rgba(0, 0, 0, 0.3)' : '#fff'
                }}>
                  {currentAdvancedFilters.map((filter) => (
                    <div key={filter.key} className="rounded-xl border border-dashed p-3" style={{
                      borderColor: isEventProMode ? 'rgba(255, 180, 44, 0.2)' : '#e0e0e0',
                      background: isEventProMode ? 'rgba(0, 0, 0, 0.2)' : '#f8f8f8'
                    }}>
                      <p className="text-sm font-semibold" style={{ color: isEventProMode ? '#FFB42C' : '#343434' }}>
                        {filter.label}
                      </p>
                      <p className="text-xs" style={{ color: isEventProMode ? 'rgba(255, 180, 44, 0.7)' : '#666' }}>
                        {filter.description || 'Filter option'}
                      </p>
                    </div>
                  ))}
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

      {/* Featured Listings - KEEPING SAME CARD DESIGN */}
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

export default HomePageThreeTabs;
