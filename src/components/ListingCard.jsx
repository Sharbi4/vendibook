import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function ListingCard({ listing }) {
  const [imageError, setImageError] = useState(false);
  
  const listingId = listing?.id;
  const title = listing?.title || 'Untitled listing';
  const city = listing?.city || listing?.city_name || '';
  const state = listing?.state || listing?.state_code || '';
  const location = [city, state].filter(Boolean).join(', ') || 'Location coming soon';
  const price = listing?.price ?? listing?.price_per_day;
  const priceUnit = listing?.price_unit || listing?.priceUnit || 'day';
  const imageUrl = listing?.image_url || listing?.imageUrl || listing?.image;
  const deliveryAvailable = Boolean(listing?.delivery_available ?? listing?.deliveryAvailable);
  const rating = listing?.rating || 'New';
  const reviews = listing?.reviews || listing?.review_count || 0;
  const host = listing?.host_name || listing?.hostName || listing?.host || '';
  const tagSource = listing?.features || listing?.tags || listing?.amenities || [];
  const tags = Array.isArray(tagSource) ? tagSource.slice(0, 3) : [];

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link
      to={listingId ? `/listing/${listingId}` : '#'}
      style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
    >
      <div>
        <div
          style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '12px',
            aspectRatio: '20/19',
            background: '#F7F7F7',
          }}
        >
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={title}
              onError={handleImageError}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #FFEDD5 0%, #FFF 50%, #FED7AA 100%)',
                fontSize: '48px',
              }}
            >
              🚚
            </div>
          )}
          {deliveryAvailable && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              Delivery Available
            </div>
          )}
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: '4px',
            }}
          >
            <h3
              style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#222',
                lineHeight: '1.3',
                flex: 1,
              }}
            >
              {title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
              <span style={{ fontSize: '14px' }}>★</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{rating}</span>
              {reviews > 0 && (
                <span style={{ fontSize: '14px', color: '#717171' }}>({reviews})</span>
              )}
            </div>
          </div>

          <p style={{ fontSize: '14px', color: '#717171', marginBottom: '4px' }}>{location}</p>
          {host && (
            <p style={{ fontSize: '14px', color: '#717171', marginBottom: '8px' }}>{host}</p>
          )}

          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {tags.map((feature, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '11px',
                    color: '#717171',
                    padding: '3px 8px',
                    background: '#F7F7F7',
                    borderRadius: '4px',
                    fontWeight: '500',
                  }}
                >
                  {feature}
                </span>
              ))}
            </div>
          )}

          <p style={{ fontSize: '15px', color: '#222', marginTop: '8px' }}>
            <span style={{ fontWeight: '600' }}>
              {price ? `$${typeof price === 'number' ? price.toLocaleString() : price}` : 'Price available upon request'}
            </span>
            {price && (
              <span style={{ fontWeight: '400', color: '#717171' }}> / {priceUnit}</span>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}
