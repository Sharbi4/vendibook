import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MapPin, Star, Check, ArrowLeft, Calendar, User, Truck, Shield } from 'lucide-react';

function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCTALoading, setIsCTALoading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/listings/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Listing not found');
          }
          throw new Error('Failed to load listing');
        }
        
        const data = await response.json();
        setListing(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  // Helper functions
  const formatPrice = (price, unit = 'per day') => {
    if (!price) return 'Contact for pricing';
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
    return `${formattedPrice} ${unit}`;
  };

  const getListingTypeLabel = (type) => {
    const labels = {
      'RENT': 'Available to Rent',
      'SALE': 'For Sale',
      'EVENT_PRO': 'Event Professional',
    };
    return labels[type] || 'Listing';
  };

  const getActionLabel = (type) => {
    const labels = {
      'RENT': 'Request to Book',
      'SALE': 'Make an Offer',
      'EVENT_PRO': 'Request Booking',
    };
    return labels[type] || 'Contact';
  };

  const handleCTA = async () => {
    setIsCTALoading(true);
    try {
      // TODO: Implement booking/inquiry API call
      const message = listing.listingType === 'RENT' 
        ? `Request to rent "${listing.title}" submitted! Host will contact you soon.`
        : listing.listingType === 'SALE'
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

  const handleMessageHost = () => {
    alert('Messaging feature coming soon! You can contact the host via email or phone.');
  };

  const retryFetch = () => {
    window.location.reload();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-gray-500">Loading listing details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-24">
            <div className="text-center max-w-md">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing Not Found</h1>
              <p className="text-gray-600 mb-8">{error || 'The listing you\'re looking for doesn\'t exist.'}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={retryFetch}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Retry
                </button>
                <button
                  onClick={() => navigate('/listings')}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
                >
                  Browse Listings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  const tags = listing.tags || [];
  const highlights = listing.highlights || [];
  const hasImage = listing.imageUrl || listing.image_url;
  const imageUrl = listing.imageUrl || listing.image_url;
  const deliveryAvailable = listing.deliveryAvailable || listing.delivery_available;
  const isVerified = listing.isVerified || listing.is_verified;
  const hostName = listing.hostName || listing.host_name || 'Host';
  const rating = listing.rating || 'New';
  const reviewCount = listing.reviewCount || listing.review_count || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/listings')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to listings</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Image */}
        <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-orange-100 via-white to-orange-200">
          {hasImage ? (
            <img
              src={imageUrl}
              alt={listing.title}
              className="w-full h-[500px] object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-full h-[500px] flex items-center justify-center text-8xl"
            style={{ display: hasImage ? 'none' : 'flex' }}
          >
            🚚
          </div>
          
          {/* Type badge */}
          <div className="absolute top-6 left-6 px-4 py-2 rounded-lg text-sm font-semibold bg-black/70 text-white backdrop-blur-sm">
            {getListingTypeLabel(listing.listingType)}
          </div>

          {/* Verified & Delivery badges */}
          <div className="absolute top-6 right-6 flex gap-2">
            {isVerified && (
              <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/90 text-emerald-600 flex items-center gap-1 backdrop-blur-sm">
                <Shield className="w-3.5 h-3.5" />
                Verified
              </div>
            )}
            {deliveryAvailable && (
              <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/90 text-green-600 flex items-center gap-1 backdrop-blur-sm">
                <Truck className="w-3.5 h-3.5" />
                Delivery
              </div>
            )}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left column - Main content */}
          <div className="lg:col-span-2">
            {/* Title and location */}
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                {listing.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">{listing.city}, {listing.state}</span>
                </div>
                {rating && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 fill-orange-500 text-orange-500" />
                    <span className="font-semibold text-gray-900">{rating}</span>
                    {reviewCount > 0 && (
                      <span className="text-gray-500">({reviewCount} reviews)</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {tags.map((tag, idx) => (
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
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="border-t border-gray-200 pt-8" />

            {/* Description */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {listing.listingType === 'EVENT_PRO' ? 'About this professional' : 'Description'}
              </h2>
              <p className="text-base leading-relaxed text-gray-700 whitespace-pre-line">
                {listing.description || 'Details coming soon. Contact the host to learn more.'}
              </p>
            </section>

            {/* Highlights */}
            {highlights.length > 0 && (
              <>
                <div className="border-t border-gray-200 pt-8 mb-10" />
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {listing.listingType === 'EVENT_PRO' ? 'Services & Expertise' : 'What\'s included'}
                  </h2>
                  <ul className="space-y-4">
                    {highlights.map((highlight, idx) => (
                      <li key={idx} className="flex gap-3">
                        <Check className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-900 leading-relaxed">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}

            {/* Metadata grid */}
            <div className="border-t border-gray-200 pt-8 mt-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Details</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Type</dt>
                  <dd className="text-base font-semibold text-gray-900">{listing.category || getListingTypeLabel(listing.listingType)}</dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Location</dt>
                  <dd className="text-base font-semibold text-gray-900">{listing.city}, {listing.state}</dd>
                </div>
                {listing.created_at && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dt className="text-sm font-medium text-gray-500 mb-1">Listed</dt>
                    <dd className="text-base font-semibold text-gray-900">
                      {new Date(listing.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Right column - Booking card */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 border border-gray-200 rounded-2xl shadow-lg p-6 bg-white">
              {/* Price */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="text-sm text-gray-500 mb-1">
                  {listing.listingType === 'RENT' ? 'Starting at' : listing.listingType === 'SALE' ? 'Listed at' : 'Hourly rate'}
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(listing.price, listing.priceUnit)}
                </div>
              </div>

              {/* Host info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                    {hostName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {listing.listingType === 'SALE' ? 'Seller' : listing.listingType === 'EVENT_PRO' ? 'Professional' : 'Host'}
                    </div>
                    <div className="text-sm text-gray-600">{hostName}</div>
                  </div>
                </div>
                {isVerified && (
                  <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                    <Check className="w-4 h-4" />
                    <span className="font-medium">Verified {listing.listingType === 'SALE' ? 'seller' : 'host'}</span>
                  </div>
                )}
              </div>

              {/* CTA buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCTA}
                  disabled={isCTALoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 disabled:opacity-60 transition-all shadow-lg hover:shadow-xl"
                >
                  {isCTALoading ? 'Submitting...' : getActionLabel(listing.listingType)}
                </button>

                <button
                  onClick={handleMessageHost}
                  className="w-full bg-white text-orange-500 border-2 border-orange-500 px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all"
                >
                  Message {listing.listingType === 'EVENT_PRO' ? 'professional' : 'host'}
                </button>
              </div>

              {/* Additional info */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                {deliveryAvailable && (
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-green-600" />
                    <span>Delivery available</span>
                  </div>
                )}
                {listing.listingType === 'SALE' && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Financing options may be available</span>
                  </div>
                )}
                {listing.listingType === 'RENT' && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Flexible booking dates</span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ListingDetailPage;
