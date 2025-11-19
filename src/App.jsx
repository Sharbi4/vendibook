import { useState } from 'react';
import { Search, MapPin, Calendar, ChevronRight, Truck, Users, UtensilsCrossed, Store, ShoppingCart, Menu, X } from 'lucide-react';

function App() {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = [
    { id: 'all', name: 'All', icon: Store, color: '#FF6B35' },
    { id: 'food-trucks', name: 'Food Trucks', icon: Truck, color: '#FF6B35' },
    { id: 'trailers', name: 'Trailers', icon: Truck, color: '#FF8C42' },
    { id: 'ghost-kitchens', name: 'Ghost Kitchens', icon: UtensilsCrossed, color: '#FFA500' },
    { id: 'vending-lots', name: 'Vending Lots', icon: MapPin, color: '#FFB84D' },
    { id: 'event-pros', name: 'Event Pros', icon: Users, color: '#FFC966' },
    { id: 'for-sale', name: 'For Sale', icon: ShoppingCart, color: '#FFD700' }
  ];

  const listings = [
    {
      id: 1,
      title: 'Fully Equipped Taco Truck - LA Style',
      category: 'food-trucks',
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

  const filteredListings = selectedCategory === 'all'
    ? listings
    : listings.filter(l => l.category === selectedCategory);

  const handleSearch = () => {
    alert(`Searching in: ${location || 'all locations'}\nDates: ${checkIn || 'Any'} - ${checkOut || 'Any'}\nCategory: ${categories.find(c => c.id === selectedCategory)?.name}`);
  };

  const handleBookNow = (listing) => {
    if (listing.category === 'for-sale') {
      alert(`Interested in purchasing: ${listing.title}\nPrice: $${listing.price.toLocaleString()}\n\nNext steps:\n- Schedule inspection\n- Get financing options\n- Contact seller`);
    } else {
      alert(`Book: ${listing.title}\nPrice: $${listing.price}/${listing.priceType}\nLocation: ${listing.location}\n\nNext: Select dates and confirm booking`);
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
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
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
                color: '#FF6B35',
                letterSpacing: '-0.5px'
              }}>
                vendibook
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <a href="#" style={{ color: '#222', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
                Rent Equipment
              </a>
              <a href="#" style={{ color: '#222', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
                Buy Equipment
              </a>
              <a href="#" style={{ color: '#222', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
                Become a Host
              </a>
            </nav>

            {/* Right Side */}
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
                background: 'linear-gradient(135deg, #FF6B35, #FF5722)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #FF6B35 100%)',
        padding: '80px 40px 120px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255, 107, 53, 0.1) 0%, transparent 50%)',
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
            Not sure? You can now <span style={{ color: '#FFD700' }}>try it</span>.
          </h1>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '48px',
            fontWeight: '400'
          }}>
            From food trucks to ghost kitchens - start your mobile business today
          </p>

          {/* Search Card */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
            maxWidth: '900px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
              {/* Location */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#222', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Location
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#717171' }} />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Where are you going?"
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

              {/* Check In */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#222', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Start Date
                </label>
                <div style={{ position: 'relative' }}>
                  <Calendar style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#717171' }} />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 44px',
                      border: '1px solid #DDD',
                      borderRadius: '8px',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Check Out */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#222', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  End Date
                </label>
                <div style={{ position: 'relative' }}>
                  <Calendar style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#717171' }} />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 44px',
                      border: '1px solid #DDD',
                      borderRadius: '8px',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                style={{
                  background: 'linear-gradient(135deg, #FF6B35, #FF5722)',
                  color: 'white',
                  border: 'none',
                  padding: '14px 32px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)',
                  whiteSpace: 'nowrap'
                }}
              >
                <Search style={{ width: '18px', height: '18px' }} />
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
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
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
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
            {filteredListings.length} stays in Arizona
          </h2>
          <p style={{ fontSize: '15px', color: '#717171' }}>
            {selectedCategory === 'all' ? 'All categories' : categories.find(c => c.id === selectedCategory)?.name}
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
              {/* Image */}
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

              {/* Content */}
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
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #FF6B35 0%, #FF5722 100%)',
        padding: '80px 40px',
        marginTop: '40px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '42px', fontWeight: '700', color: 'white', marginBottom: '20px', letterSpacing: '-1px' }}>
            Ready to start your mobile business?
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.95)', marginBottom: '32px' }}>
            Join hundreds of entrepreneurs who've launched with Vendibook
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={{
              background: 'white',
              color: '#FF6B35',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              Browse Equipment
            </button>
            <button style={{
              background: 'rgba(0,0,0,0.2)',
              color: 'white',
              border: '2px solid white',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              List Your Truck
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#F7F7F7', padding: '48px 40px', marginTop: '0' }}>
        <div style={{ maxWidth: '1760px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '32px' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#222' }}>Support</h4>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Help Center</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Safety information</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Cancellation options</a>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#222' }}>Community</h4>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Blog</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Success stories</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Host resources</a>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#222' }}>Hosting</h4>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>List your truck</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Pricing calculator</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Host protection</a>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#222' }}>Vendibook</h4>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>About us</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Press</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: '#717171', marginBottom: '12px', textDecoration: 'none' }}>Careers</a>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #DDD', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '14px', color: '#717171' }}>
              © 2025 Vendibook LLC · All rights reserved
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#" style={{ fontSize: '14px', color: '#717171', textDecoration: 'none' }}>Privacy</a>
              <a href="#" style={{ fontSize: '14px', color: '#717171', textDecoration: 'none' }}>Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;