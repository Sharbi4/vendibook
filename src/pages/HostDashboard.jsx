import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Plus, Edit, Eye, Pause, Play } from 'lucide-react';
import { getListingTypeInfo, formatPrice } from '../data/listings';
import { getHostListings, updateListingStatus } from '../utils/auth';

function HostDashboard() {
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState([]);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const listings = await getHostListings();
      setMyListings(listings);
    } catch (error) {
      console.error('Failed to load listings:', error);
    }
  };

  const toggleStatus = async (listingId) => {
    const listing = myListings.find(l => l.id === listingId);
    if (!listing) return;

    const newStatus = listing.status === 'live' ? 'paused' : 'live';

    try {
      await updateListingStatus(listingId, newStatus);
      // Update local state
      setMyListings(prevListings =>
        prevListings.map(l =>
          l.id === listingId ? { ...l, status: newStatus } : l
        )
      );
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update listing status');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #EBEBEB'
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
            <button
              onClick={() => navigate('/host/onboarding')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#FF5124',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              Create New Listing
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 40px' }}>
        <h1 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '32px', color: '#343434' }}>
          Your Listings
        </h1>

        {myListings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 40px',
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #EBEBEB'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#343434' }}>
              No listings yet
            </h2>
            <p style={{ fontSize: '16px', color: '#717171', marginBottom: '32px' }}>
              Create your first listing to start earning
            </p>
            <button
              onClick={() => navigate('/host/onboarding')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#FF5124',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Plus style={{ width: '20px', height: '20px' }} />
              Create Your First Listing
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '24px' }}>
            {myListings.map(listing => {
              const typeInfo = getListingTypeInfo(listing.listingType);
              const status = listing.status || 'live';

              return (
                <div
                  key={listing.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '200px 1fr auto',
                    gap: '24px',
                    padding: '24px',
                    background: 'white',
                    border: '1px solid #EBEBEB',
                    borderRadius: '16px',
                    alignItems: 'center'
                  }}
                >
                  {/* Image */}
                  <div style={{
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    aspectRatio: '4/3'
                  }}>
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      padding: '4px 8px',
                      background: typeInfo.bgColor,
                      color: typeInfo.color,
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {typeInfo.label}
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#343434' }}>
                      {listing.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#717171', marginBottom: '8px' }}>
                      {listing.city}, {listing.state}
                    </p>
                    <p style={{ fontSize: '18px', fontWeight: '600', color: '#343434' }}>
                      {formatPrice(listing.price, listing.priceUnit)}
                    </p>
                    <div style={{
                      marginTop: '12px',
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: status === 'live' ? '#E8F5E9' : '#F7F7F7',
                      color: status === 'live' ? '#2E7D32' : '#717171',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {status === 'live' ? '● Live' : '○ Paused'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      onClick={() => navigate(`/listing/${listing.id}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        border: '1px solid #EBEBEB',
                        borderRadius: '8px',
                        background: 'white',
                        color: '#343434',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      <Eye style={{ width: '16px', height: '16px' }} />
                      View
                    </button>
                    <button
                      onClick={() => toggleStatus(listing.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        border: '1px solid #EBEBEB',
                        borderRadius: '8px',
                        background: 'white',
                        color: '#343434',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      {status === 'live' ? (
                        <>
                          <Pause style={{ width: '16px', height: '16px' }} />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play style={{ width: '16px', height: '16px' }} />
                          Activate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default HostDashboard;
