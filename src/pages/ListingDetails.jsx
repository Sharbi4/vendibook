import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, MapPin, Star, Check, Shield, Truck, Calendar } from 'lucide-react';
import { getListingById as getMockListingById } from '../data/listings';

const normalizeValue = (value) => (value ? value.toString().toLowerCase() : '');

const formatListingType = (type, category) => {
  const normalizedType = normalizeValue(type || category);

  switch (normalizedType) {
    case 'food-truck':
    case 'food_truck':
    case 'foodtrucks':
      return 'Food truck rental';
    case 'trailer':
    case 'trailers':
      return 'Food trailer rental';
    case 'ghost-kitchen':
    case 'ghost_kitchen':
      return 'Ghost kitchen access';
    case 'event-pro':
    case 'event_pro':
    case 'eventpro':
      return 'Event Pro – Catering / Service';
    case 'vending-lots':
    case 'vending_lots':
      return 'Vending location rental';
    case 'for-sale':
    case 'for_sale':
      return 'Listing for sale';
    default:
      return (type || category || 'Listing').toString();
  }
};

const formatCategoryBadge = (type, category) => {
  const label = (type || category || 'Listing').toString();
  return label.replace(/[_\s]+/g, '-').toUpperCase();
};

const buildEventProPackages = (listing) => {
  const baseName = listing?.title?.split(' ')?.slice(0, 3).join(' ') || 'Signature';

  return [
    {
      name: `${baseName} Tasting Experience`,
      description:
        'Curated tasting menu with 3 chef-selected entrées, seasonal sides, and dessert service. Includes staffing and setup.',
      price: '$1,200 flat • up to 40 guests',
    },
    {
      name: 'Catering Package – Up to 75 guests',
      description:
        'Includes 2 entrée options, 2 sides, beverages, and dessert. Perfect for corporate lunches or private events.',
      price: '$1,950 flat • up to 3 hours service',
    },
    {
      name: 'Full-Service Event',
      description:
        'Custom menu design, staffing, rentals coordination, and onsite execution. Ideal for weddings and large celebrations.',
      price: 'Custom quote • 4 hour minimum',
    },
  ];
};

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');

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
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
              throw new Error('Unexpected response format');
            }

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

          const fallbackContentType = fallbackResponse.headers.get('content-type') || '';
          if (!fallbackContentType.includes('application/json')) {
            throw new Error('Listing not found');
          }

          try {
            record = await fallbackResponse.json();
          } catch (jsonError) {
            throw new Error('Listing not found');
          }
        }

        if (!record) {
          const mockListing = getMockListingById(`${id}`);
          if (mockListing) {
            record = mockListing;
          }
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

  useEffect(() => {
    setStartDate('');
    setEndDate('');
    setEventDate('');
    setEventEndTime('');
  }, [listing?.id]);

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
  const rawType = listing.listing_type || listing.listingType || listing.category;

  const normalizedType = normalizeValue(rawType);
  const isEventPro = normalizedType === 'event-pro' || normalizedType === 'event_pro' || normalizedType === 'eventpro' || normalizedType === 'event';

  const categoryBadgeLabel = useMemo(() => formatCategoryBadge(rawType, listing.category), [rawType, listing.category]);
  const listingTypeLabel = useMemo(() => formatListingType(rawType, listing.category), [rawType, listing.category]);
  const eventProPackages = useMemo(() => (isEventPro ? buildEventProPackages(listing) : []), [isEventPro, listing]);
  const detailItems = useMemo(() => {
    const items = [
      { label: 'Type', value: listingTypeLabel },
      { label: 'Base price', value: formatPrice(listing.price, priceUnit) },
      { label: 'City', value: listing.city },
      { label: 'State', value: listing.state },
    ];

    if (deliveryAvailable) {
      items.push({ label: 'Delivery', value: 'Available upon request' });
    }

    if (isVerified) {
      items.push({ label: 'Verified', value: 'Vendibook verified host' });
    }

    if (createdAt) {
      items.push({
        label: 'Listed',
        value: new Date(createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      });
    }

    return items;
  }, [createdAt, deliveryAvailable, isVerified, listing.city, listing.state, listing.price, listingTypeLabel, priceUnit]);

  const formattedPrice = useMemo(() => formatPrice(listing.price, priceUnit), [listing.price, priceUnit]);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4 sm:px-6">
          <button
            onClick={() => navigate('/listings')}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to listings
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <section className="mb-8">
          <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF4E0] to-[#FFE7C2] p-6 sm:h-80 lg:h-96">
            <span className="absolute left-6 top-6 inline-flex items-center rounded-full bg-slate-900/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-lg">
              {categoryBadgeLabel}
            </span>

            <div className="absolute right-6 top-6 flex flex-wrap justify-end gap-2">
              {isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-600 shadow">
                  <Shield className="h-3.5 w-3.5" /> Verified
                </span>
              )}
              {deliveryAvailable && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-green-600 shadow">
                  <Truck className="h-3.5 w-3.5" /> Delivery
                </span>
              )}
            </div>

            <div className="relative flex h-full w-full items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={listing.title}
                  className="h-44 w-44 rounded-3xl object-cover shadow-[0_18px_40px_rgba(15,23,42,0.18)] ring-4 ring-white/70"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                    const fallback = event.currentTarget.nextElementSibling;
                    if (fallback) fallback.removeAttribute('hidden');
                  }}
                />
              ) : null}

              <div
                hidden={Boolean(imageUrl)}
                className="flex h-32 w-32 items-center justify-center rounded-3xl bg-white/80 text-5xl shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
              >
                🚚
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
          <div className="space-y-8">
            <article className="rounded-3xl bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
              <header className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{listingTypeLabel}</p>
                  <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                    {listing.title}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-slate-600 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {listing.city}, {listing.state}
                  </span>
                  {(listing.rating || listing.reviewCount || listing.review_count) && (
                    <span className="inline-flex items-center gap-2 text-slate-700">
                      <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                      {listing.rating || '5.0'}
                      {(listing.reviewCount || listing.review_count) && (
                        <span className="text-slate-500">
                          ({listing.reviewCount || listing.review_count} reviews)
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </header>

              {tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
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

              <section className="mt-6 space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">Description</h2>
                <p className="text-base leading-relaxed text-slate-700 whitespace-pre-line">
                  {listing.description || 'Details coming soon. Contact the host to learn more about this listing.'}
                </p>
              </section>
            </article>

            {isEventPro && (
              <article className="rounded-3xl bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
                <section>
                  <h2 className="text-lg font-semibold text-slate-900">Packages & Menu</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Tailored experiences to match your event size and style. Choose a starting point and we&apos;ll customize the menu for you.
                  </p>
                  <div className="mt-6 space-y-4">
                    {eventProPackages.map((pkg) => (
                      <div
                        key={pkg.name}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                      >
                        <p className="text-sm font-semibold text-slate-900">{pkg.name}</p>
                        <p className="mt-1 text-sm text-slate-600">{pkg.description}</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{pkg.price}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </article>
            )}

            <article className="rounded-3xl bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
              <section>
                <h2 className="text-lg font-semibold text-slate-900">Details</h2>
                <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {detailItems.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5">
                      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</dt>
                      <dd className="mt-2 text-sm font-semibold text-slate-900">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </article>

            {highlights.length > 0 && (
              <article className="rounded-3xl bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
                <section>
                  <h2 className="text-lg font-semibold text-slate-900">Highlights</h2>
                  <ul className="mt-5 space-y-4">
                    {highlights.map((highlight, index) => (
                      <li key={`${highlight}-${index}`} className="flex gap-3">
                        <Check className="mt-1 h-5 w-5 flex-shrink-0 text-orange-500" />
                        <span className="text-sm text-slate-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </article>
            )}
          </div>

          <aside className="w-full lg:max-w-sm">
            <div className="sticky top-24 space-y-6 rounded-3xl bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.12)] sm:p-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {isEventPro ? 'Starting package at' : 'Starting at'}
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{formattedPrice}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {isEventPro ? 'Custom quotes available for larger activations.' : `Base rate ${priceUnit}`}
                </p>
              </div>

              <div className="space-y-4">
                {isEventPro ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="event-date">
                        Event date
                      </label>
                      <input
                        id="event-date"
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="event-end-time">
                        End time (optional)
                      </label>
                      <input
                        id="event-end-time"
                        type="time"
                        value={eventEndTime}
                        onChange={(e) => setEventEndTime(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="start-date">
                        Start date
                      </label>
                      <input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="end-date">
                        End date
                      </label>
                      <input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleBookNow}
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
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

              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
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
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default ListingDetails;
