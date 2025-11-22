import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Star, Check, Shield, Truck, Calendar } from 'lucide-react';

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    const controller = new AbortController();

    const fetchListing = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let record = null;

        // Attempt to fetch via query param endpoint first
        try {
          const response = await fetch(`/api/listings?id=${encodeURIComponent(id)}`, {
            signal: controller.signal,
          });

          if (response.ok) {
            const payload = await response.json();
            const collection = payload?.data || payload?.listings || [];
            if (Array.isArray(collection)) {
              record = collection.find((item) => `${item?.id}` === `${id}`) || null;
            }
          }
        } catch (queryError) {
          if (queryError.name !== 'AbortError') {
            console.warn('Primary listings query failed, attempting fallback.', queryError);
          }
        }

        // Fallback to explicit ID route if needed
        if (!record) {
          const fallbackResponse = await fetch(`/api/listings/${encodeURIComponent(id)}`, {
            signal: controller.signal,
          });

          if (fallbackResponse.status === 404) {
            throw new Error('Listing not found');
          }

          if (!fallbackResponse.ok) {
            throw new Error('Failed to load listing');
          }

          record = await fallbackResponse.json();
        }

        if (!record) {
          throw new Error('Listing not found');
        }

        if (isMounted) {
          setListing(record);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        if (isMounted) {
          setError(err.message || 'Unable to load listing');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchListing();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id, reloadKey]);

  const formatPrice = (price, unit = 'per day') => {
    if (price === undefined || price === null || price === '') {
      return 'Contact for pricing';
    }

    const value = Number(price);
    const formatted = Number.isFinite(value)
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value)
      : price;

    return `${formatted} ${unit}`;
  };

  const retryFetch = () => {
    setListing(null);
    setError(null);
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  const handleBookNow = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      alert('Booking request submitted! A host will reach out shortly.');
      setIsSubmitting(false);
    }, 700);
  };

  const handleMessageHost = () => {
    alert('Messaging coming soon! For now, contact the host directly.');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-2 border-orange-200 border-t-orange-500" />
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-[0.2em]">Loading listing</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-lg">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Listing unavailable</h1>
            <p className="text-gray-600 mb-10">
              {error || 'We could not find the listing you were looking for.'}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <button
                onClick={retryFetch}
                className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Retry
              </button>
              <button
                onClick={() => navigate('/listings')}
                className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
              >
                Browse other listings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = listing.imageUrl || listing.image_url;
  const deliveryAvailable = listing.deliveryAvailable || listing.delivery_available;
  const isVerified = listing.isVerified || listing.is_verified;
  const tags = Array.isArray(listing.tags) ? listing.tags : [];
  const highlights = Array.isArray(listing.highlights) ? listing.highlights : [];
  const createdAt = listing.created_at || listing.createdAt;
  const priceUnit = listing.price_unit || listing.priceUnit || 'per day';

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/listings')}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to listings
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-orange-100 via-white to-orange-200">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={listing.title}
              className="h-[500px] w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
                const fallback = event.currentTarget.nextElementSibling;
                if (fallback) fallback.removeAttribute('hidden');
              }}
            />
          ) : null}

          <div
            hidden={Boolean(imageUrl)}
            className="flex h-[500px] w-full items-center justify-center text-7xl"
          >
            🚚
          </div>

          <div className="absolute left-6 top-6 flex items-center gap-3">
            <div className="rounded-xl bg-black/70 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow">
              {listing.listing_type || listing.listingType || 'Listing'}
            </div>
          </div>

          <div className="absolute right-6 top-6 flex gap-2">
            {isVerified && (
              <span className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-600 backdrop-blur">
                <Shield className="h-3.5 w-3.5" /> Verified
              </span>
            )}
            {deliveryAvailable && (
              <span className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-green-600 backdrop-blur">
                <Truck className="h-3.5 w-3.5" /> Delivery
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
                {listing.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1 text-sm font-medium">
                  <MapPin className="h-5 w-5" />
                  {listing.city}, {listing.state}
                </span>
                {(listing.rating || listing.reviewCount || listing.review_count) && (
                  <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    <Star className="h-5 w-5 fill-orange-500 text-orange-500" />
                    {listing.rating || '5.0'}
                    {(listing.reviewCount || listing.review_count) && (
                      <span className="text-gray-500">
                        ({listing.reviewCount || listing.review_count} reviews)
                      </span>
                    )}
                  </span>
                )}
              </div>
            </header>

            {tags.length > 0 && (
              <div className="mb-10 flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="rounded-full bg-[#F7F7F7] px-3 py-1 text-xs font-medium text-[#717171]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <section className="border-t border-gray-200 pt-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                Description
              </h2>
              <p className="text-base leading-relaxed text-gray-700 whitespace-pre-line">
                {listing.description || 'Details coming soon. Contact the host to learn more about this listing.'}
              </p>
            </section>

            {highlights.length > 0 && (
              <section className="mt-10 border-t border-gray-200 pt-8">
                <h2 className="mb-5 text-2xl font-semibold text-gray-900">
                  Highlights
                </h2>
                <ul className="space-y-4">
                  {highlights.map((highlight, index) => (
                    <li key={`${highlight}-${index}`} className="flex gap-3">
                      <Check className="mt-1 h-6 w-6 flex-shrink-0 text-orange-500" />
                      <span className="text-gray-800">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-10 border-t border-gray-200 pt-8">
              <h2 className="mb-5 text-2xl font-semibold text-gray-900">Details</h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-gray-50 p-5">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Type</dt>
                  <dd className="text-base font-semibold text-gray-900">
                    {listing.category || listing.listing_type || listing.listingType || 'Marketplace Listing'}
                  </dd>
                </div>
                <div className="rounded-2xl bg-gray-50 p-5">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">City</dt>
                  <dd className="text-base font-semibold text-gray-900">{listing.city}</dd>
                </div>
                <div className="rounded-2xl bg-gray-50 p-5">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">State</dt>
                  <dd className="text-base font-semibold text-gray-900">{listing.state}</dd>
                </div>
                {createdAt && (
                  <div className="rounded-2xl bg-gray-50 p-5">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Listed</dt>
                    <dd className="text-base font-semibold text-gray-900">
                      {new Date(createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl">
              <div className="mb-6 border-b border-gray-200 pb-6">
                <p className="text-sm font-medium text-gray-500">Starting at</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {formatPrice(listing.price, priceUnit)}
                </p>
              </div>

              <div className="mb-6 border-b border-gray-200 pb-6 space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Flexible scheduling available
                </div>
                {deliveryAvailable && (
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-green-600" />
                    Delivery available upon request
                  </div>
                )}
                {isVerified && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    Verified host
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleBookNow}
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 px-6 py-4 text-sm font-semibold text-white shadow-xl transition hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Submitting...' : 'Book Now'}
                </button>
                <button
                  onClick={handleMessageHost}
                  className="w-full rounded-xl border-2 border-orange-500 px-6 py-3 text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
                >
                  Message Host
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ListingDetails;
