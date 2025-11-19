import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Truck, MapPin, Star, Check } from 'lucide-react';
import { getListingTypeInfo, formatPrice, LISTING_TYPES, getListingById } from '../data/listings';

function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCTALoading, setIsCTALoading] = useState(false);

  // FRONTEND ONLY: Using mock data. Will be replaced with API call in backend integration phase.
  const listing = getListingById(id);
  const isLoading = false;
  const error = listing ? null : 'Listing not found';

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading listing...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '16px' }}>Listing not found</h1>
          {error && <p style={{ color: '#D84D42', marginBottom: '16px' }}>{error}</p>}
          <button
            onClick={() => navigate('/listings')}
            style={{
              background: '#FF5124',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Browse Listings
          </button>
        </div>
      </div>
    );
  }

  const typeInfo = getListingTypeInfo(listing.listingType);

  const handleCTA = async () => {
    setIsCTALoading(true);
    try {
      // FRONTEND ONLY: Mock action. Will be replaced with API call in backend integration phase.
      const message = listing.listingType === LISTING_TYPES.RENT 
        ? `Request to rent "${listing.title}" submitted! Host will contact you soon.`
        : listing.listingType === LISTING_TYPES.SALE
        ? `Inquiry about "${listing.title}" submitted! Seller will contact you soon.`
        : `Request to book ${listing.title} for event submitted! Professional will contact you soon.`;
      
      setTimeout(() => {
        alert(message);
        setIsCTALoading(false);
      }, 800);
    } catch (err) {
      alert('Failed to submit request: ' + err.message);
      setIsCTALoading(false);
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
            <div
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
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
              <span style={{ fontSize: '20px', fontWeight: '700', color: '#FF5124' }}>
                vendibook
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 40px' }}>
        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', marginBottom: '32px' }}>
          <img
            src={listing.imageUrl}
            alt={listing.title}
            style={{ width: '100%', height: '500px', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            padding: '8px 16px',
            background: typeInfo.bgColor,
            color: typeInfo.color,
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {typeInfo.label}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '48px' }}>
          {/* Main Content */}
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px', color: '#343434' }}>
              {listing.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star style={{ width: '16px', height: '16px', fill: '#FF5124', color: '#FF5124' }} />
                <span style={{ fontSize: '16px', fontWeight: '600' }}>{listing.rating}</span>
                <span style={{ fontSize: '16px', color: '#717171' }}>({listing.reviewCount} reviews)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin style={{ width: '16px', height: '16px', color: '#717171' }} />
                <span style={{ fontSize: '16px', color: '#717171' }}>{listing.city}, {listing.state}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
              {listing.tags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '8px 16px',
                    background: '#F7F7F7',
                    borderRadius: '20px',
                    fontSize: '14px',
                    color: '#343434'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #EBEBEB', paddingTop: '32px', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#343434' }}>
                {listing.listingType === LISTING_TYPES.EVENT_PRO ? 'About this event pro' : 'Description'}
              </h2>
              <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#717171', marginBottom: '24px' }}>
                {listing.description}
              </p>
            </div>

            <div style={{ borderTop: '1px solid #EBEBEB', paddingTop: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#343434' }}>
                {listing.listingType === LISTING_TYPES.EVENT_PRO ? 'Services & Expertise' : 'Highlights'}
              </h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {listing.highlights.map((highlight, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      marginBottom: '16px',
                      fontSize: '16px',
                      color: '#343434'
                    }}
                  >
                    <Check style={{ width: '20px', height: '20px', color: '#FF5124', flexShrink: 0 }} />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Booking Card */}
          <div>
            <div style={{
              position: 'sticky',
              top: '100px',
              padding: '24px',
              border: '1px solid #EBEBEB',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', color: '#717171', marginBottom: '4px' }}>
                  {typeInfo.pricePrefix}
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#343434' }}>
                  {formatPrice(listing.price, listing.priceUnit)}
                </div>
              </div>

              <div style={{ marginBottom: '24px', padding: '16px', background: '#F7F7F7', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#343434' }}>
                  Host: {listing.hostName}
                </div>
                {listing.isVerified && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#FF5124' }}>
                    <Check style={{ width: '14px', height: '14px' }} />
                    Verified {listing.listingType === LISTING_TYPES.SALE ? 'Seller' : 'Host'}
                  </div>
                )}
              </div>

              <button
                onClick={handleCTA}
                disabled={isCTALoading}
                style={{
                  width: '100%',
                  background: '#FF5124',
                  color: 'white',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isCTALoading ? 'not-allowed' : 'pointer',
                  marginBottom: '12px',
                  opacity: isCTALoading ? 0.6 : 1
                }}
              >
                {isCTALoading ? 'Submitting...' : typeInfo.actionLabel}
              </button>

              {listing.listingType === LISTING_TYPES.RENT && listing.deliveryAvailable && (
                <p style={{ fontSize: '13px', color: '#717171', textAlign: 'center' }}>
                  ✓ Delivery available
                </p>
              )}

              {listing.listingType === LISTING_TYPES.SALE && (
                <p style={{ fontSize: '13px', color: '#717171', textAlign: 'center' }}>
                  Financing options available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingDetailPage;
