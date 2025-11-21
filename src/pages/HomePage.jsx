import { useState, useEffect } from 'react';
import { useListings } from '../hooks/useListings.js';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, ChevronRight, Truck, Users, UtensilsCrossed, Store, ShoppingCart, Menu, X, ChevronDown, ChevronUp, Star, Check, DollarSign, Zap, Coffee } from 'lucide-react';

function HomePage() {
  const navigate = useNavigate();
  // Search modal state
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [listingType, setListingType] = useState('rent'); // 'rent', 'sale', 'event-pro'
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    category: 'all',
    startDate: '',
    endDate: '',
    priceMin: '',
    priceMax: '',
    amenities: [],
    deliveryOnly: false,
    verifiedOnly: false
  });

  // All categories for top navigation
  const allCategories = [
    { id: 'all', name: 'All', icon: Store, color: '#FF5124', emoji: '🏪' },
    { id: 'food-trucks', name: 'Food Trucks', icon: Truck, color: '#FF5124', emoji: '🚚' },
    { id: 'trailers', name: 'Trailers', icon: Truck, color: '#FF8C42', emoji: '🚐' },
    { id: 'ghost-kitchens', name: 'Ghost Kitchens', icon: UtensilsCrossed, color: '#FFA500', emoji: '🍴' },
    { id: 'vending-lots', name: 'Vending Lots', icon: MapPin, color: '#FFB84D', emoji: '📍' },
    { id: 'event-pros', name: 'Event Pros', icon: Users, color: '#FFC966', emoji: '👥' },
    { id: 'for-sale', name: 'For Sale', icon: ShoppingCart, color: '#FF5124', emoji: '🛒' }
  ];

  // Categories by listing type (for search modal)
  const categoriesByType = {
    rent: [
      { id: 'all', name: 'All', icon: Store, color: '#FF5124', emoji: '🏪' },
      { id: 'food-trucks', name: 'Food Trucks', icon: Truck, color: '#FF5124', emoji: '🚚' },
      { id: 'trailers', name: 'Trailers', icon: Truck, color: '#FF8C42', emoji: '🚐' },
      { id: 'ghost-kitchens', name: 'Ghost Kitchens', icon: UtensilsCrossed, color: '#FFA500', emoji: '🍴' },
      { id: 'vending-lots', name: 'Vending Lots', icon: MapPin, color: '#FFB84D', emoji: '📍' }
    ],
    sale: [
      { id: 'all', name: 'All', icon: Store, color: '#FF5124', emoji: '🏪' },
      { id: 'for-sale', name: 'Food Trucks', icon: ShoppingCart, color: '#FF5124', emoji: '🚚' },
      { id: 'trailers-sale', name: 'Trailers', icon: ShoppingCart, color: '#FFA500', emoji: '🚐' },
      { id: 'equipment', name: 'Equipment', icon: ShoppingCart, color: '#FF8C42', emoji: '⚙️' }
    ],
    'event-pro': [
      { id: 'all', name: 'All', icon: Users, color: '#FF5124', emoji: '👥' },
      { id: 'chefs', name: 'Chefs', icon: Users, color: '#FFC966', emoji: '👨‍🍳' },
      { id: 'caterers', name: 'Caterers', icon: Users, color: '#FFB84D', emoji: '🍽️' },
      { id: 'baristas', name: 'Baristas', icon: Coffee, color: '#FFA500', emoji: '☕' },
      { id: 'event-staff', name: 'Event Staff', icon: Users, color: '#FF8C42', emoji: '🎉' }
    ]
  };

  const currentCategories = categoriesByType[listingType] || categoriesByType.rent;

  const amenitiesList = ['Power', 'Water', 'Propane', 'Full Kitchen', 'Storage', 'WiFi'];

  const navLinks = [
    { label: 'Rent Equipment', path: '/listings' },
    { label: 'Buy Equipment', path: '/listings' },
    { label: 'Become a Host', path: '/become-host' },
    { label: 'Community', path: '/community' },
    { label: 'Profile', path: '/profile' }
  ];

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

  const handleSearch = () => {
    // Build query string for navigation
    const params = new URLSearchParams();
    if (listingType && listingType !== 'rent') params.set('type', listingType.toUpperCase());
    if (location) params.set('location', location);
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (priceMin) params.set('priceMin', priceMin);
    if (priceMax) params.set('priceMax', priceMax);
    if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','));
    if (deliveryOnly) params.set('deliveryOnly', 'true');
    if (verifiedOnly) params.set('verifiedOnly', 'true');

    // Navigate to listings page with search params
    navigate(`/listings?${params.toString()}`);
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

      if (!startDate || (startDate && endDate)) {
        // Set start date
        setStartDate(dateStr);
        setEndDate('');
      } else if (startDate && !endDate) {
        // Set end date
        if (new Date(dateStr) >= new Date(startDate)) {
          setEndDate(dateStr);
          setShowCalendar(false);
        } else {
          // If selected date is before start, reset
          setStartDate(dateStr);
          setEndDate('');
        }
      }
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
      return dateStr === startDate || dateStr === endDate;
    };

    const isInRange = (day) => {
      if (!startDate || !endDate) return false;
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const date = new Date(dateStr);
      return date > new Date(startDate) && date < new Date(endDate);
    };

    return (
      <div style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: '8px',
        background: 'white',
        border: '1px solid #DDD',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        minWidth: '300px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>←</button>
          <div style={{ fontWeight: '600', fontSize: '15px' }}>{monthNames[currentMonth]} {currentYear}</div>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>→</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#717171' }}>{day}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
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
                onClick={() => handleDateClick(day)}
                style={{
                  padding: '8px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  background: selected ? '#FF5124' : inRange ? '#FFF3F0' : 'transparent',
                  color: selected ? 'white' : '#222',
                  fontWeight: selected ? '600' : '400'
                }}
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
              <button style={{
                color: '#222',
                fontSize: '14px',
                fontWeight: '600',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '22px',
                transition: 'background 0.2s'
              }}>
                Sign In
              </button>
              <button style={{
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
              }}>
                Sign Up
              </button>
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

          {/* Simplified Search Trigger */}
          <div
            onClick={() => setSearchModalOpen(true)}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px 32px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
              maxWidth: '900px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>
                Search for rentals, sales, or event pros
              </div>
              <div style={{ fontSize: '14px', color: '#717171' }}>
                {appliedSearch.location || 'Any location'} • {appliedSearch.category !== 'all' ? allCategories.find(c => c.id === appliedSearch.category)?.name : 'All categories'} • {appliedSearch.startDate ? `${appliedSearch.startDate} to ${appliedSearch.endDate || '...'}` : 'Any dates'}
              </div>
            </div>
            <div style={{
              background: '#FF5124',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600',
              fontSize: '15px'
            }}>
              <Search style={{ width: '18px', height: '18px' }} />
              Search
            </div>
          </div>
        </div>
      </section>

      {/* Search Modal */}
      {searchModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid #EBEBEB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#222' }}>Search Vendibook</h2>
              <button
                onClick={() => setSearchModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X style={{ width: '24px', height: '24px', color: '#717171' }} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              {/* Listing Type Segmented Control */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#222', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  I'm looking to
                </label>
                <div style={{ display: 'flex', gap: '8px', background: '#F7F7F7', padding: '4px', borderRadius: '12px' }}>
                  {[
                    { id: 'rent', label: 'Rent Equipment' },
                    { id: 'sale', label: 'Buy Equipment' },
                    { id: 'event-pro', label: 'Book Event Pro' }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setListingType(type.id);
                        setSelectedCategory('all');
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: 'none',
                        borderRadius: '8px',
                        background: listingType === type.id ? 'white' : 'transparent',
                        color: listingType === type.id ? '#FF5124' : '#717171',
                        fontWeight: listingType === type.id ? '600' : '500',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: listingType === type.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#222', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Location
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#717171' }} />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Phoenix, AZ"
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 44px',
                      border: '1px solid #DDD',
                      borderRadius: '8px',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                  />
                </div>
              </div>

              {/* Category */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#222', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Category
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>
                    {currentCategories.find(c => c.id === selectedCategory)?.emoji || '🏪'}
                  </span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 44px',
                      border: '1px solid #DDD',
                      borderRadius: '8px',
                      fontSize: '15px',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none',
                      background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23717171' d='M6 9L1 4h10z'/%3E%3C/svg%3E") no-repeat right 14px center`,
                      backgroundColor: 'white'
                    }}
                  >
                    {currentCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Range */}
              <div style={{ marginBottom: '20px', position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#222', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Dates
                </label>
                <div
                  onClick={() => setShowCalendar(!showCalendar)}
                  style={{
                    padding: '14px 14px 14px 44px',
                    border: '1px solid #DDD',
                    borderRadius: '8px',
                    fontSize: '15px',
                    cursor: 'pointer',
                    position: 'relative',
                    background: 'white'
                  }}
                >
                  <Calendar style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#717171' }} />
                  {startDate && endDate ? (
                    <span style={{ color: '#222' }}>{startDate} to {endDate}</span>
                  ) : startDate ? (
                    <span style={{ color: '#222' }}>{startDate} (select end date)</span>
                  ) : (
                    <span style={{ color: '#717171' }}>Select dates</span>
                  )}
                </div>
                {showCalendar && <SimpleDatePicker />}
              </div>

              {/* More Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #DDD',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#222',
                  marginBottom: '20px'
                }}
              >
                <span>More filters</span>
                {showFilters ? <ChevronUp style={{ width: '18px', height: '18px' }} /> : <ChevronDown style={{ width: '18px', height: '18px' }} />}
              </button>

              {/* Filters Panel */}
              {showFilters && (
                <div style={{ padding: '20px', background: '#F7F7F7', borderRadius: '12px', marginBottom: '20px' }}>
                  {/* Price Range */}
                  <div style={{ marginBottom: '20px' }}>
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
                          borderRadius: '8px',
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
                          borderRadius: '8px',
                          fontSize: '15px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#222', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Amenities
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {amenitiesList.map(amenity => (
                        <button
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          style={{
                            padding: '8px 16px',
                            border: `2px solid ${selectedAmenities.includes(amenity) ? '#FF5124' : '#DDD'}`,
                            borderRadius: '20px',
                            background: selectedAmenities.includes(amenity) ? '#FFF3F0' : 'white',
                            color: selectedAmenities.includes(amenity) ? '#FF5124' : '#717171',
                            fontSize: '13px',
                            fontWeight: selectedAmenities.includes(amenity) ? '600' : '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {selectedAmenities.includes(amenity) && <Check style={{ width: '14px', height: '14px' }} />}
                          {amenity}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={deliveryOnly}
                        onChange={(e) => setDeliveryOnly(e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#222' }}>Delivery Available only</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#222' }}>Verified Hosts only</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Search Button */}
              <button
                onClick={handleSearch}
                style={{
                  width: '100%',
                  background: '#FF5124',
                  color: 'white',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(255, 81, 36, 0.4)'
                }}
              >
                <Search style={{ width: '20px', height: '20px' }} />
                {listingType === 'rent' ? 'Find Rentals' : listingType === 'sale' ? 'Find Equipment' : 'Find Event Pros'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Category Filter (existing sticky nav) */}
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
            {allCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = appliedSearch.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setAppliedSearch({ ...appliedSearch, category: cat.id });
                  }}
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
                    minWidth: '100px',
                    opacity: isActive ? 1 : 0.7
                  }}
                >
                  <Icon style={{
                    width: '24px',
                    height: '24px',
                    color: isActive ? cat.color : '#717171'
                  }} />
                  <span style={{
                    fontSize: '12px',
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? cat.color : '#222',
                    whiteSpace: 'nowrap'
                  }}>
                    {cat.name}
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
            {appliedSearch.category !== 'all' ? allCategories.find(c => c.id === appliedSearch.category)?.name : 'All categories'}
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
                  {listing.features.slice(0, 3).map((feature, idx) => (
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
