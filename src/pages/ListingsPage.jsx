import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Store, X } from 'lucide-react';
import { listings, LISTING_TYPES, filterListings, getCategoriesByType } from '../data/listings';
import { useSearchParams } from '../hooks/useSearchParams';
import ListingCard from '../components/ListingCard';

function ListingsPage() {
  const navigate = useNavigate();
  const searchState = useSearchParams();
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Filter listings based on current search state
    const filtered = filterListings(listings, {
      listingType: searchState.listingType,
      category: searchState.category !== 'all' ? searchState.category : undefined,
      location: searchState.location,
      priceMin: searchState.priceMin,
      priceMax: searchState.priceMax,
      deliveryOnly: searchState.deliveryOnly,
      verifiedOnly: searchState.verifiedOnly,
      amenities: searchState.amenities
    });
    setFilteredData(filtered);
  }, [searchState]);

  const ListingTypeTab = ({ type, label }) => {
    const isActive = searchState.listingType === type;
    return (
      <button
        onClick={() => searchState.updateSearch({ listingType: type, category: 'all' })}
        style={{
          padding: '12px 24px',
          border: 'none',
          borderBottom: isActive ? `3px solid #FF5124` : '3px solid transparent',
          background: 'transparent',
          color: isActive ? '#FF5124' : '#717171',
          fontWeight: isActive ? '600' : '500',
          fontSize: '15px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        {label}
      </button>
    );
  };

  const ActiveFilter = ({ label, onClear }) => (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 12px',
      background: '#F7F7F7',
      borderRadius: '20px',
      fontSize: '13px',
      marginRight: '8px',
      marginBottom: '8px'
    }}>
      <span>{label}</span>
      <button
        onClick={onClear}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: '2px'
        }}
      >
        <X style={{ width: '14px', height: '14px', color: '#717171' }} />
      </button>
    </div>
  );

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
            <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <button
                onClick={() => navigate('/become-host')}
                style={{ 
                  background: 'none',
                  border: 'none',
                  color: '#343434', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  cursor: 'pointer'
                }}
              >
                Become a Host
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Listing Type Tabs */}
      <section style={{ background: 'white', borderBottom: '1px solid #EBEBEB' }}>
        <div style={{ maxWidth: '1760px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <ListingTypeTab type={LISTING_TYPES.RENT} label="For Rent" />
            <ListingTypeTab type={LISTING_TYPES.SALE} label="For Sale" />
            <ListingTypeTab type={LISTING_TYPES.EVENT_PRO} label="Event Pros" />
          </div>
        </div>
      </section>

      {/* Active Filters */}
      {searchState.hasActiveFilters && (
        <section style={{ background: '#FAFAFA', borderBottom: '1px solid #EBEBEB', padding: '16px 0' }}>
          <div style={{ maxWidth: '1760px', margin: '0 auto', padding: '0 40px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', marginRight: '8px' }}>Active filters:</span>
              {searchState.location && (
                <ActiveFilter
                  label={`Location: ${searchState.location}`}
                  onClear={() => searchState.clearFilter('location')}
                />
              )}
              {searchState.category && searchState.category !== 'all' && (
                <ActiveFilter
                  label={`Category: ${searchState.category}`}
                  onClear={() => searchState.clearFilter('category')}
                />
              )}
              {(searchState.priceMin || searchState.priceMax) && (
                <ActiveFilter
                  label={`Price: $${searchState.priceMin || '0'} - $${searchState.priceMax || '∞'}`}
                  onClear={() => searchState.clearFilter('price')}
                />
              )}
              {searchState.deliveryOnly && (
                <ActiveFilter
                  label="Delivery Available"
                  onClear={() => searchState.clearFilter('deliveryOnly')}
                />
              )}
              {searchState.verifiedOnly && (
                <ActiveFilter
                  label="Verified Hosts"
                  onClear={() => searchState.clearFilter('verifiedOnly')}
                />
              )}
              <button
                onClick={() => searchState.resetSearch()}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FF5124',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Clear all
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Results Header */}
      <section style={{ maxWidth: '1760px', margin: '0 auto', padding: '32px 40px 0' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#343434', marginBottom: '8px' }}>
          {filteredData.length} results
        </h1>
      </section>

      {/* Listings Grid */}
      <section style={{ maxWidth: '1760px', margin: '0 auto', padding: '32px 40px 80px' }}>
        {filteredData.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {filteredData.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: '#FAFAFA',
            borderRadius: '16px'
          }}>
            <Store style={{ width: '64px', height: '64px', color: '#717171', margin: '0 auto 16px', opacity: 0.5 }} />
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#343434' }}>
              No listings found
            </h2>
            <p style={{ fontSize: '16px', color: '#717171', marginBottom: '24px' }}>
              Try adjusting your filters or search criteria
            </p>
            <button
              onClick={() => searchState.resetSearch()}
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
              Reset filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default ListingsPage;
