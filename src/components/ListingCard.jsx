import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Check } from 'lucide-react';
import { getListingTypeInfo, formatPrice } from '../data/listings';

/**
 * ListingCard - Reusable card component for displaying listings
 * Shows image, type badge, title, location, price, rating, and key tags
 */
export default function ListingCard({ listing }) {
  const navigate = useNavigate();
  const typeInfo = getListingTypeInfo(listing.listingType);

  return (
    <div
      onClick={() => navigate(`/listing/${listing.id}`)}
      style={{
        cursor: 'pointer',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        border: '1px solid #EBEBEB',
        transition: 'all 0.2s ease',
        transform: 'translateY(0)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* Image Container */}
      <div style={{ position: 'relative', paddingBottom: '66.67%', backgroundColor: '#f0f0f0', overflow: 'hidden' }}>
        <img
          src={listing.imageUrl}
          alt={listing.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        {/* Type Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: typeInfo.bgColor,
            color: typeInfo.color,
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          {typeInfo.label}
        </div>

        {/* Verified Badge */}
        {listing.isVerified && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: '#10B981',
              color: 'white',
              padding: '6px 10px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: '600'
            }}
          >
            <Check size={14} />
            Verified
          </div>
        )}

        {/* Delivery Badge */}
        {listing.deliveryAvailable && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '500'
            }}
          >
            Delivery Available
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {/* Title */}
        <h3
          style={{
            fontSize: '15px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#343434',
            lineHeight: '1.3',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {listing.title}
        </h3>

        {/* Location */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#717171',
            fontSize: '13px',
            marginBottom: '12px'
          }}
        >
          <MapPin size={14} />
          <span>{listing.city}, {listing.state}</span>
        </div>

        {/* Price */}
        <div
          style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#FF5124',
            marginBottom: '8px'
          }}
        >
          {formatPrice(listing.price, listing.priceUnit)}
        </div>

        {/* Rating */}
        {listing.rating && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#717171',
              fontSize: '12px',
              marginBottom: '10px'
            }}
          >
            <Star size={14} fill="#FFB42C" stroke="#FFB42C" />
            <span>{listing.rating}</span>
            <span>({listing.reviewCount} reviews)</span>
          </div>
        )}

        {/* Tags */}
        {listing.tags && listing.tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              marginTop: '10px'
            }}
          >
            {listing.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '11px',
                  backgroundColor: '#FAFAFA',
                  color: '#717171',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #EBEBEB'
                }}
              >
                {tag}
              </span>
            ))}
            {listing.tags.length > 3 && (
              <span
                style={{
                  fontSize: '11px',
                  color: '#FF5124',
                  padding: '4px 8px'
                }}
              >
                +{listing.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
