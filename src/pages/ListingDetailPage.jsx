import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MapPin, Star, Check } from 'lucide-react';
import { getListingTypeInfo, formatPrice, LISTING_TYPES, getListingById } from '../data/listings';
import PageShell from '../components/layout/PageShell';

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
      <PageShell title="Loading listing" subtitle="Fetching details" maxWidth="max-w-5xl">
        <div className="flex items-center justify-center py-24">
          <p className="text-gray-500">Loading listing...</p>
        </div>
      </PageShell>
    );
  }

  if (error || !listing) {
    return (
      <PageShell title="Listing not found" subtitle="Try browsing other inventory" maxWidth="max-w-5xl">
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <button
              onClick={() => navigate('/listings')}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Browse Listings
            </button>
          </div>
        </div>
      </PageShell>
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
    <PageShell
      title={listing.title}
      subtitle={`${listing.city}, ${listing.state}`}
      maxWidth="max-w-5xl"
      action={{ label: 'Back to Listings', onClick: () => navigate('/listings') }}
    >
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden mb-10 bg-gray-100">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="w-full h-96 object-cover"
        />
        <div
          className={`absolute top-6 left-6 px-3 py-1 rounded-lg text-sm font-semibold ${typeInfo.bgColor} ${typeInfo.color}`}
          aria-label={`Listing type: ${typeInfo.label}`}
        >
          {typeInfo.label}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row gap-6 mb-8" aria-label="Listing statistics">
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

          <div className="flex flex-wrap gap-2 mb-10" aria-label="Listing tags">
            {listing.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-900"
              >
                {tag}
              </span>
            ))}
          </div>

            <section className="border-t border-gray-200 pt-8 mb-10" aria-labelledby="section-description">
              <h2 id="section-description" className="text-2xl font-semibold mb-4 text-gray-900">
                {listing.listingType === LISTING_TYPES.EVENT_PRO ? 'About this event pro' : 'Description'}
              </h2>
              <p className="text-base leading-relaxed text-gray-700 mb-6">
                {listing.description}
              </p>
            </section>

            <section className="border-t border-gray-200 pt-8" aria-labelledby="section-highlights">
              <h2 id="section-highlights" className="text-2xl font-semibold mb-4 text-gray-900">
                {listing.listingType === LISTING_TYPES.EVENT_PRO ? 'Services & Expertise' : 'Highlights'}
              </h2>
              <ul className="space-y-4" aria-label="Key highlights">
                {listing.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex gap-3">
                    <Check className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900">{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>
        </div>

        {/* Booking Card */}
        <aside>
          <div className="sticky top-24 p-6 border border-gray-200 rounded-lg shadow-sm" aria-label="Booking actions">
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
                <div className="flex items-center gap-1 text-sm text-orange-500" aria-label="Verified host">
                  <Check className="w-4 h-4" />
                  Verified {listing.listingType === LISTING_TYPES.SALE ? 'Seller' : 'Host'}
                </div>
              )}
            </div>

            <button
              onClick={handleCTA}
              disabled={isCTALoading}
              className="w-full bg-orange-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-60 transition mb-3"
              aria-label={typeInfo.actionLabel}
            >
              {isCTALoading ? 'Submitting...' : typeInfo.actionLabel}
            </button>

            <button
              onClick={handleMessageHost}
              className="w-full bg-white text-orange-500 border-2 border-orange-500 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition mb-3"
              aria-label="Message host"
            >
              Message {listing.listingType === LISTING_TYPES.EVENT_PRO ? 'Professional' : 'Host'}
            </button>

            {listing.listingType === LISTING_TYPES.RENT && listing.deliveryAvailable && (
              <p className="text-xs text-gray-600 text-center" aria-label="Delivery available">
                ✓ Delivery available
              </p>
            )}

            {listing.listingType === LISTING_TYPES.SALE && (
              <p className="text-xs text-gray-600 text-center" aria-label="Financing options available">
                Financing options available
              </p>
            )}
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

export default ListingDetailPage;
