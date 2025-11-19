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
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading listing...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-semibold mb-4">Listing not found</h1>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <button
            onClick={() => navigate('/listings')}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
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

  const handleMessageHost = () => {
    // TODO: Create message thread with host and navigate to messages
    const hostId = listing.hostId; // Assume this is added to listing data
    if (!hostId) {
      alert('Host information not available');
      return;
    }
    // TODO: Call API to create thread
    // navigate(`/messages?hostId=${hostId}&listingId=${id}`);
    console.log('Message host:', listing.hostName);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
          >
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-orange-500">
              vendibook
            </span>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative rounded-xl overflow-hidden mb-8 bg-gray-100">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-96 object-cover"
          />
          <div className={`absolute top-6 left-6 px-3 py-1 rounded-lg text-sm font-semibold ${typeInfo.bgColor} ${typeInfo.color}`}>
            {typeInfo.label}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">
              {listing.title}
            </h1>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-orange-500 text-orange-500" />
                <span className="font-semibold text-gray-900">{listing.rating}</span>
                <span className="text-gray-600">({listing.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{listing.city}, {listing.state}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {listing.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-900"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-8 mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                {listing.listingType === LISTING_TYPES.EVENT_PRO ? 'About this event pro' : 'Description'}
              </h2>
              <p className="text-base leading-relaxed text-gray-700 mb-6">
                {listing.description}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                {listing.listingType === LISTING_TYPES.EVENT_PRO ? 'Services & Expertise' : 'Highlights'}
              </h2>
              <ul className="space-y-4">
                {listing.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex gap-3">
                    <Check className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Booking Card */}
          <div>
            <div className="sticky top-24 p-6 border border-gray-200 rounded-lg shadow-sm">
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">
                  {typeInfo.pricePrefix}
                </div>
                <div className="text-4xl font-bold text-gray-900">
                  {formatPrice(listing.price, listing.priceUnit)}
                </div>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold mb-2 text-gray-900">
                  Host: {listing.hostName}
                </div>
                {listing.isVerified && (
                  <div className="flex items-center gap-1 text-sm text-orange-500">
                    <Check className="w-4 h-4" />
                    Verified {listing.listingType === LISTING_TYPES.SALE ? 'Seller' : 'Host'}
                  </div>
                )}
              </div>

              <button
                onClick={handleCTA}
                disabled={isCTALoading}
                className="w-full bg-orange-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-60 transition mb-3"
              >
                {isCTALoading ? 'Submitting...' : typeInfo.actionLabel}
              </button>

              <button
                onClick={handleMessageHost}
                className="w-full bg-white text-orange-500 border-2 border-orange-500 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition mb-3"
              >
                Message {listing.listingType === LISTING_TYPES.EVENT_PRO ? 'Professional' : 'Host'}
              </button>

              {listing.listingType === LISTING_TYPES.RENT && listing.deliveryAvailable && (
                <p className="text-xs text-gray-600 text-center">
                  ✓ Delivery available
                </p>
              )}

              {listing.listingType === LISTING_TYPES.SALE && (
                <p className="text-xs text-gray-600 text-center">
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
