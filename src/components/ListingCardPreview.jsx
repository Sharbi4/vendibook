import { Star } from 'lucide-react';
import { getListingTypeInfo, formatPrice } from '../data/listings';

/**
 * ListingCardPreview Component
 *
 * Displays a preview of how a listing will look to customers.
 * Used in HostOnboardingWizard live preview panel.
 * Mirrors the design of ListingCard component.
 *
 * @param {Object} listingData - Partial listing object with title, price, etc.
 */
function ListingCardPreview({ listingData }) {
  if (!listingData.listingType) {
    return (
      <div style={{
        border: '1px solid #EBEBEB',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        color: '#717171'
      }}>
        <p>Choose a listing type to see preview</p>
      </div>
    );
  }

  const typeInfo = getListingTypeInfo(listingData.listingType);

  return (
    <div style={{
      border: '1px solid #EBEBEB',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'white',
      transition: 'box-shadow 0.2s'
    }}>
      {/* Image Section */}
      <div style={{
        position: 'relative',
        aspectRatio: '20/19',
        background: '#F7F7F7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {listingData.imageUrl ? (
          <img
            src={listingData.imageUrl}
            alt="Preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            color: '#EBEBEB',
            fontSize: '48px'
          }}>
            📷
          </div>
        )}

        {/* Type Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          padding: '6px 12px',
          background: typeInfo.bgColor,
          color: typeInfo.color,
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {typeInfo.label}
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: '16px' }}>
        {/* Title */}
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '8px',
          color: '#343434',
          minHeight: '24px',
          lineHeight: '1.5'
        }}>
          {listingData.title || 'Your listing title'}
        </h4>

        {/* Location */}
        <p style={{
          fontSize: '14px',
          color: '#717171',
          marginBottom: '8px',
          minHeight: '21px'
        }}>
          {listingData.city && listingData.state
            ? `${listingData.city}, ${listingData.state}`
            : 'City, State'}
        </p>

        {/* Rating */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginBottom: '12px'
        }}>
          <Star style={{
            width: '14px',
            height: '14px',
            fill: '#FF5124',
            color: '#FF5124'
          }} />
          <span style={{ fontSize: '14px', fontWeight: '600' }}>New</span>
        </div>

        {/* Tags/Amenities */}
        {listingData.amenities && listingData.amenities.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginBottom: '12px'
          }}>
            {listingData.amenities.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '11px',
                  color: '#717171',
                  padding: '4px 8px',
                  background: '#F7F7F7',
                  borderRadius: '4px'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <p style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#343434'
        }}>
          {listingData.price && listingData.priceUnit
            ? formatPrice(parseInt(listingData.price), listingData.priceUnit)
            : 'Set your price'}
        </p>
      </div>
    </div>
  );
}

export default ListingCardPreview;
