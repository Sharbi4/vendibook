import { useState } from 'react';
import { useListings } from '../hooks/useListings.js';
import { useNavigate } from 'react-router-dom';
import { Truck, Star, Check, Store, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import HeroSearch from '../components/home/HeroSearch.jsx';
import { CATEGORY_OPTIONS, CATEGORY_MAP, DEFAULT_CATEGORY } from '../config/categories.js';

function HomePage() {
  const navigate = useNavigate();

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Applied search params (after clicking Search button)
  const [appliedSearch, setAppliedSearch] = useState({
    listingType: 'all',
    location: '',
    category: DEFAULT_CATEGORY.value,
    startDate: '',
    endDate: '',
    priceMin: '',
    priceMax: '',
    amenities: [],
    deliveryOnly: false,
    verifiedOnly: false
  });

  const amenitiesList = ['Power', 'Water', 'Propane', 'Full Kitchen', 'Storage', 'WiFi'];

  const { isAuthenticated, needsVerification } = useAuth();

  const baseNavLinks = [
    { label: 'Rent Equipment', path: '/listings' },
    { label: 'Buy Equipment', path: '/listings' },
    { label: 'Become a Host', path: '/become-host' },
    { label: 'Community', path: '/community' }
  ];
  const navLinks = isAuthenticated ? [...baseNavLinks, { label: 'Profile', path: '/profile' }] : baseNavLinks;

  // Fetch dynamic listings from API (Neon) and merge with legacy mock data until fully migrated
  const { listings: dynamicListings, loading: listingsLoading } = useListings(appliedSearch);

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
  const filteredListings = combinedListings.filter(listing => {
    // Listing type filter
    if (appliedSearch.listingType !== 'all' && listing.listingType !== appliedSearch.listingType) {
      return false;
    }

    // Category filter
    if (appliedSearch.category !== 'all' && listing.category !== appliedSearch.category) {
      return false;
    }

    // Location filter (simple contains check)
    if (appliedSearch.location && !listing.location.toLowerCase().includes(appliedSearch.location.toLowerCase())) {
      return false;
    }

    // Price filter
    if (appliedSearch.priceMin && listing.price < parseInt(appliedSearch.priceMin)) {
      return false;
    }
    if (appliedSearch.priceMax && listing.price > parseInt(appliedSearch.priceMax)) {
      return false;
    }

    // Delivery filter
    if (appliedSearch.deliveryOnly && !listing.deliveryAvailable) {
      return false;
    }

    // Verified host filter
    if (appliedSearch.verifiedOnly && !listing.host.includes('Verified') && !listing.host.includes('Superhost')) {
      return false;
    }

    // Amenities filter
    if (appliedSearch.amenities.length > 0) {
      const hasAllAmenities = appliedSearch.amenities.every(amenity =>
        listing.features.some(feature => feature.toLowerCase().includes(amenity.toLowerCase()))
      );
      if (!hasAllAmenities) {
        return false;
      }
    }

    return true;
  });

  const heroCategoryLabel = CATEGORY_MAP[appliedSearch.category]?.label || CATEGORY_MAP[DEFAULT_CATEGORY.value].label;
  const heroLocationLabel = appliedSearch.location || 'Anywhere';
  const heroDateLabel = appliedSearch.startDate
    ? appliedSearch.endDate
      ? `${appliedSearch.startDate} → ${appliedSearch.endDate}`
      : `${appliedSearch.startDate} (flexible)`
    : 'Flexible dates';

  const parseLocationInput = (value = '') => {
    const trimmed = value.trim();
    if (!trimmed) return { city: '', state: '' };
    const [cityPart = '', statePart = ''] = trimmed.split(',').map((part) => part.trim());
    return {
      city: cityPart,
      state: statePart ? statePart.slice(0, 2).toUpperCase() : ''
    };
  };

  const formatListingTypeParam = (intent) => {
    if (!intent || intent === 'all') return '';
    if (intent === 'event-pro') return 'EVENT_PRO';
    return intent.toUpperCase();
  };

  const handleSearch = (nextValues = {}) => {
    const {
      location: rawLocation = appliedSearch.location || '',
      startDate: nextStartDate = appliedSearch.startDate || '',
      endDate: nextEndDate = appliedSearch.endDate || '',
      category: nextCategory = appliedSearch.category || DEFAULT_CATEGORY.value,
      listingIntent = appliedSearch.listingType || 'all',
      listingType = undefined,
    } = nextValues;

    const listingTypeParam = listingType ?? formatListingTypeParam(listingIntent);
    const { city, state } = parseLocationInput(rawLocation);

    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (state) params.set('state', state);
    if (listingTypeParam) params.set('listingType', listingTypeParam);
    if (nextCategory && nextCategory !== 'all') params.set('category', nextCategory);
    if (nextStartDate) params.set('startDate', nextStartDate);
    if (nextEndDate) params.set('endDate', nextEndDate);
    if (priceMin) params.set('priceMin', priceMin);
    if (priceMax) params.set('priceMax', priceMax);
    if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','));
    if (deliveryOnly) params.set('deliveryOnly', 'true');
    if (verifiedOnly) params.set('verifiedOnly', 'true');

    navigate(params.toString() ? `/listings?${params.toString()}` : '/listings');

    setAppliedSearch((prev) => ({
      ...prev,
      listingType: listingIntent,
      location: rawLocation,
      category: nextCategory,
      startDate: nextStartDate,
      endDate: nextEndDate,
      priceMin,
      priceMax,
      amenities: selectedAmenities,
      deliveryOnly,
      verifiedOnly,
    }));
  };

  const handleBookNow = (listing) => {
    if (listing.category === 'for-sale') {
      alert(`Interested in purchasing: ${listing.title}\nPrice: $${listing.price.toLocaleString()}\n\nNext steps:\n- Schedule inspection\n- Get financing options\n- Contact seller`);
    } else {
      alert(`Book: ${listing.title}\nPrice: $${listing.price}/${listing.priceType}\nLocation: ${listing.location}\n\nNext: Select dates and confirm booking`);
    }
  };

  const toggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };


  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'white',
        borderBottom: '1px solid #EBEBEB',
        boxShadow: '0 1px 0 rgba(0,0,0,0.05)'
      }}>
        <div style={{ maxWidth: '1760px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: '#FF5124',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Truck style={{ width: '18px', height: '18px', color: 'white' }} />
              </div>
              <span style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#FF5124',
                letterSpacing: '-0.5px'
              }}>
                vendibook
              </span>
            </div>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => navigate(link.path)}
                  style={{
                    color: '#222',
                    fontSize: '14px',
                    fontWeight: '500',
                    textDecoration: 'none',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    style={{
                      color: '#222',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px 16px',
                      borderRadius: '22px',
                      transition: 'background 0.2s'
                    }}
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    style={{
                      background: '#FF5124',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(255, 81, 36, 0.3)',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                  >
                    Get started
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/profile')}
                  style={{
                    background: '#FF5124',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(255, 81, 36, 0.3)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>My profile</span>
                  {needsVerification && (
                    <span style={{
                      background: '#FFD8BF',
                      color: '#A0420F',
                      borderRadius: '999px',
                      padding: '2px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      Unverified
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #FF5124 100%)',
        padding: '80px 40px 120px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255, 81, 36, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1180px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '16px',
            lineHeight: '1.1',
            letterSpacing: '-2px'
          }}>
            Not sure? You can now <span style={{ color: '#FF5124' }}>try it</span>.
          </h1>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '48px',
            fontWeight: '400'
          }}>
            From food trucks to ghost kitchens—start your mobile business today
          </p>

          <div className="space-y-4" style={{ maxWidth: '960px' }}>
            <HeroSearch
              initialValues={{
                location: appliedSearch.location,
                startDate: appliedSearch.startDate,
                endDate: appliedSearch.endDate,
                category: appliedSearch.category,
              }}
              onSubmit={handleSearch}
            />
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-white/80">
              <span>{heroLocationLabel}</span>
              <span>•</span>
              <span>{heroCategoryLabel}</span>
              <span>•</span>
              <span>{heroDateLabel}</span>
            </div>
          </div>
        </div>
      </section>
      <section style={{ background: 'white', padding: '32px 40px 16px', borderBottom: '1px solid #F2F2F2' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#222' }}>Dial in your search</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '14px', color: '#717171' }}>Refine pricing, amenities, and delivery preferences</p>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '999px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: '600',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <Sparkles style={{ width: '16px', height: '16px', color: '#FF5124' }} />
                {showFilters ? 'Hide advanced filters' : 'Show advanced filters'}
                {showFilters ? <ChevronUp style={{ width: '16px', height: '16px' }} /> : <ChevronDown style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>
          </div>

          {showFilters && (
            <div style={{
              border: '1px solid #EBEBEB',
              borderRadius: '24px',
              padding: '24px',
              background: '#FCFCFC',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#222', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Price Range
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      placeholder="Min"
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '1px solid #DDD',
                        borderRadius: '12px',
                        fontSize: '15px',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      placeholder="Max"
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '1px solid #DDD',
                        borderRadius: '12px',
                        fontSize: '15px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#222', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Amenities
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {amenitiesList.map((amenity) => {
                    const active = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        style={{
                          padding: '8px 16px',
                          border: `2px solid ${active ? '#FF5124' : '#DDD'}`,
                          borderRadius: '999px',
                          background: active ? '#FFF3F0' : 'white',
                          color: active ? '#FF5124' : '#717171',
                          fontSize: '13px',
                          fontWeight: active ? '600' : '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {active && <Check style={{ width: '14px', height: '14px' }} />}
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '16px', borderRadius: '16px', background: 'white', border: '1px solid #EEE' }}>
                  <input
                    type="checkbox"
                    checked={deliveryOnly}
                    onChange={(e) => setDeliveryOnly(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#222' }}>Delivery available only</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '16px', borderRadius: '16px', background: 'white', border: '1px solid #EEE' }}>
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#222' }}>Verified hosts only</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setPriceMin('');
                    setPriceMax('');
                    setSelectedAmenities([]);
                    setDeliveryOnly(false);
                    setVerifiedOnly(false);
                  }}
                  style={{
                    border: '1px solid #E0E0E0',
                    background: 'white',
                    borderRadius: '999px',
                    padding: '12px 20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Reset filters
                </button>
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  style={{
                    background: '#FF5124',
                    color: 'white',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(255, 81, 36, 0.25)'
                  }}
                >
                  Apply search
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quick Category Filter */}
      <section style={{
        borderBottom: '1px solid #EBEBEB',
        background: 'white',
        position: 'sticky',
        top: '80px',
        zIndex: 50,
        boxShadow: '0 1px 0 rgba(0,0,0,0.05)'
      }}>
        <div style={{ maxWidth: '1760px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '24px 0' }}>
            {CATEGORY_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = appliedSearch.category === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSearch({ category: option.value })}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    border: isActive ? `2px solid ${option.color}` : '2px solid transparent',
                    borderRadius: '12px',
                    background: isActive ? `${option.color}10` : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minWidth: '100px',
                    opacity: isActive ? 1 : 0.7
                  }}
                >
                  <Icon style={{
                    width: '24px',
                    height: '24px',
                    color: isActive ? option.color : '#717171'
                  }} />
                  <span style={{
                    fontSize: '12px',
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? option.color : '#222',
                    whiteSpace: 'nowrap'
                  }}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section style={{ maxWidth: '1760px', margin: '0 auto', padding: '48px 40px 80px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '600', color: '#222', marginBottom: '8px' }}>
            {filteredListings.length} {appliedSearch.listingType === 'event-pro' ? 'event pros' : appliedSearch.listingType === 'sale' ? 'listings for sale' : 'rentals'} in Arizona
          </h2>
          <p style={{ fontSize: '15px', color: '#717171' }}>
            {appliedSearch.category !== 'all'
              ? CATEGORY_MAP[appliedSearch.category]?.label
              : 'All categories'}
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
                    color: '#222',
                    lineHeight: '1.3',
                    flex: 1
                  }}>
                    {listing.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
                    <span style={{ fontSize: '14px' }}>★</span>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{listing.rating}</span>
                    <span style={{ fontSize: '14px', color: '#717171' }}>({listing.reviews})</span>
                  </div>
                </div>

                <p style={{ fontSize: '14px', color: '#717171', marginBottom: '4px' }}>
                  {listing.location}
                </p>
                <p style={{ fontSize: '14px', color: '#717171', marginBottom: '8px' }}>
                  {listing.host}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {(listing.features || []).slice(0, 3).map((feature, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '11px',
                        color: '#717171',
                        padding: '3px 8px',
                        background: '#F7F7F7',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <p style={{ fontSize: '15px', color: '#222', marginTop: '8px' }}>
                  <span style={{ fontWeight: '600' }}>
                    ${listing.priceType === 'sale' ? listing.price.toLocaleString() : listing.price}
                  </span>
                  <span style={{ fontWeight: '400', color: '#717171' }}>
                    {listing.priceType === 'sale' ? '' : ` / ${listing.priceType}`}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#717171' }}>
            <Store style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
            <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No results found</p>
            <p style={{ fontSize: '15px' }}>Try adjusting your filters or search criteria</p>
          </div>
        )}
      </section>

      {/* How Vendibook Works Section */}
      <section style={{ background: '#F7F7F7', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '16px', color: '#222' }}>
            How Vendibook Works
          </h2>
          <p style={{ fontSize: '18px', textAlign: 'center', color: '#717171', marginBottom: '60px' }}>
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
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#222' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '15px', color: '#717171', lineHeight: '1.6' }}>
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
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '16px', color: '#222' }}>
            Trusted by Mobile Business Owners
          </h2>
          <p style={{ fontSize: '18px', textAlign: 'center', color: '#717171', marginBottom: '60px' }}>
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
                background: '#F7F7F7',
                borderRadius: '16px',
                border: '1px solid #EBEBEB'
              }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} style={{ width: '16px', height: '16px', fill: '#FF5124', color: '#FF5124' }} />
                  ))}
                </div>
                <p style={{ fontSize: '15px', color: '#222', lineHeight: '1.6', marginBottom: '20px', fontStyle: 'italic' }}>
                  "{review.quote}"
                </p>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#222' }}>{review.author}</div>
                  <div style={{ fontSize: '13px', color: '#717171' }}>{review.business}</div>
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
              onClick={() => handleSearch()}
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
            <button
              onClick={() => navigate('/become-host')}
              style={{
                background: 'rgba(0,0,0,0.2)',
                color: 'white',
                border: '2px solid white',
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Become a Host
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#F7F7F7', padding: '48px 40px', marginTop: '0' }}>
        <div style={{ maxWidth: '1760px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '32px' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#222' }}>Rent</h4>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Food Trucks</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Trailers</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Ghost Kitchens</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Vending Lots</a>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#222' }}>Buy</h4>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Buy Equipment</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Financing Options</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Inspection Services</a>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#222' }}>Host</h4>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Become a Host</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Host Protection</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Pricing Calculator</a>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#222' }}>Support</h4>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Help Center</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>FAQ</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Contact Us</a>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #DDD', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <p style={{ fontSize: '14px', color: '#717171' }}>
              © 2025 Vendibook LLC · All rights reserved
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#" style={{ fontSize: '14px', color: '#717171', textDecoration: 'none' }}>Privacy</a>
              <a href="#" style={{ fontSize: '14px', color: '#717171', textDecoration: 'none' }}>Terms</a>
              <a href="#" style={{ fontSize: '14px', color: '#717171', textDecoration: 'none' }}>Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
