import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, MapPin, Star, Check, Shield, Truck, Calendar, UserCircle } from 'lucide-react';
import { getListingById as getMockListingById } from '../data/listings';
import { AvailabilityCalendar } from '../components/AvailabilityCalendar';
import { ListingMapPlaceholder } from '../components/ListingMapPlaceholder';
import { useEventProPackages } from '../hooks/useEventProPackages';
import { useAuth } from '../hooks/useAuth';
import { useAppStatus } from '../hooks/useAppStatus';

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

const BOOKING_MODE_LABELS = {
  daily: 'Daily rental',
  'daily-with-time': 'Daily rental + times',
  hourly: 'Hourly event',
  package: 'Event package'
};

const formatTimePreset = (value) => {
  if (!value) return '';
  const parts = String(value).split(':');
  const hours = parts[0]?.padStart(2, '0') || '00';
  const minutes = parts[1]?.padStart(2, '0') || '00';
  return `${hours}:${minutes}`;
};

const calculateSelectedDays = (start, end) => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 0;
  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(Math.floor(diff / 86400000) + 1, 0);
};

const calculateSelectedHours = (date, startTime, endTime) => {
  if (!date || !startTime || !endTime) return 0;
  const start = new Date(`${date}T${startTime}:00`);
  const end = new Date(`${date}T${endTime}:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diff = (end.getTime() - start.getTime()) / 3600000;
  return diff > 0 ? diff : 0;
};

const formatCurrency = (value) => {
  if (!Number.isFinite(value)) return null;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const extractHostUserId = (listing) =>
  listing?.host_id ||
  listing?.host_user_id ||
  listing?.hostUserId ||
  listing?.hostId ||
  listing?.owner_id ||
  listing?.ownerId ||
  listing?.user_id ||
  listing?.userId ||
  null;

const buildInitials = (value) => {
  if (!value) return 'VH';
  const initials = value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase())
    .join('');
  return initials || 'VH';
};

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const { setGlobalLoading, setGlobalError } = useAppStatus();
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [pickupTime, setPickupTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [bookingFeedback, setBookingFeedback] = useState(null);
  const [calendarNotice, setCalendarNotice] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [hostProfile, setHostProfile] = useState({ status: 'idle', data: null, error: '' });

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
            const collection = payload?.data ?? payload?.listings ?? null;
            if (Array.isArray(collection)) {
              record = collection.find((item) => `${item?.id}` === `${id}`) || null;
            } else if (collection && typeof collection === 'object') {
              record = collection;
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
    setStartDate(null);
    setEndDate(null);
    setPickupTime(formatTimePreset(listing?.default_start_time || listing?.defaultStartTime));
    setReturnTime(formatTimePreset(listing?.default_end_time || listing?.defaultEndTime));
    setEventStartTime('');
    setEventEndTime('');
    setBookingFeedback(null);
    setCalendarNotice(null);
    setSelectedPackage(null);
  }, [listing?.id, listing?.default_start_time, listing?.defaultStartTime, listing?.default_end_time, listing?.defaultEndTime]);

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

  const handleBookNow = async () => {
    if (!listing?.id) {
      return;
    }

    const renterUserId = user?.id || user?._id || user?.userId;
    const renterClerkId = user?.clerkId || user?.clerk_id || user?.clerkID || null;

    if (!isAuthenticated || !renterUserId) {
      setBookingFeedback({ type: 'error', message: 'Please sign in to request a booking.' });
      return;
    }

    if (!hostUserId) {
      setBookingFeedback({ type: 'error', message: 'Host information is missing for this listing. Please contact support.' });
      return;
    }

    if (!startDate) {
      setBookingFeedback({ type: 'error', message: 'Select your dates before booking.' });
      return;
    }

    if (!isHourlyMode && !selectedEndDate) {
      setBookingFeedback({ type: 'error', message: 'Select your end date before booking.' });
      return;
    }

    if (isHourlyMode && (!eventStartTime || !eventEndTime)) {
      setBookingFeedback({ type: 'error', message: 'Select your event start and end times.' });
      return;
    }

    setIsSubmitting(true);
    setBookingFeedback(null);
    setCalendarNotice(null);
    setGlobalLoading(true);

    const nightlyRate = Number(listing?.price) || 0;
    const fallbackPrice = nightlyRate > 0 ? nightlyRate : 1;
    const totalPriceValue = estimatedTotalValue && estimatedTotalValue > 0 ? estimatedTotalValue : fallbackPrice;

    const payload = {
      listingId: listing.id,
      renterUserId,
      hostUserId,
      bookingMode,
      totalPrice: totalPriceValue,
      currency: listing?.currency || 'USD',
      eventCity: null,
      eventState: null,
      eventPostalCode: null,
      eventFullAddress: null,
    };
    // TODO: Collect renter-supplied event address details and populate the fields above before validating service radius.

    const hostClerkId = listing?.host_clerk_id || listing?.hostClerkId || null;
    if (renterClerkId) {
      payload.renterClerkId = renterClerkId;
    }
    if (hostClerkId) {
      payload.hostClerkId = hostClerkId;
    }

    if (isHourlyMode) {
      payload.eventDate = startDate;
      payload.eventStartTime = eventStartTime;
      payload.eventEndTime = eventEndTime;
      payload.startDate = startDate;
      payload.endDate = startDate;
    } else {
      payload.startDate = startDate;
      payload.endDate = selectedEndDate;
      if (bookingMode === 'daily-with-time') {
        payload.pickupTime = pickupTime || null;
        payload.returnTime = returnTime || null;
      }
    }

    // Attach selected Event Pro package metadata if the renter chose a package
    if (selectedPackage) {
      payload.packageId = selectedPackage.id;
      payload.packageName = selectedPackage.name;
      payload.packageBasePrice = Number(selectedPackage.base_price ?? selectedPackage.basePrice ?? selectedPackage.price ?? 0);
      // TODO: Consider storing package_id and package_pricing on bookings table for accounting
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      if (renterClerkId) {
        headers['x-clerk-id'] = renterClerkId;
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 && (data?.error === 'DATE_RANGE_UNAVAILABLE' || data?.message)) {
          setCalendarNotice(data.message || 'The selected dates are not available. Please adjust your selection.');
          return;
        }

        if (response.status === 401) {
          setBookingFeedback({ type: 'error', message: 'Your session expired. Please sign in again.' });
          return;
        }

        throw new Error(data.message || data.error || 'Unable to submit booking right now.');
      }

      setBookingFeedback({ type: 'success', message: 'Booking request submitted! Redirecting to My Bookings...' });
      setTimeout(() => navigate('/bookings'), 1000);
    } catch (submitError) {
      setBookingFeedback({ type: 'error', message: submitError.message || 'Unable to submit booking right now.' });
      setGlobalError(submitError.message || 'Unable to submit booking right now.');
    } finally {
      setIsSubmitting(false);
      setGlobalLoading(false);
    }
  };

  const handleMessageHost = () => {
    setBookingFeedback(null);
    alert('Messaging coming soon! For now, contact the host directly.');
  };

  const imageUrl = listing?.imageUrl || listing?.image_url;
  const deliveryAvailable = listing?.deliveryAvailable || listing?.delivery_available;
  const isVerified = listing?.isVerified || listing?.is_verified;
  const tags = Array.isArray(listing?.tags) ? listing.tags : [];
  const highlights = Array.isArray(listing?.highlights) ? listing.highlights : [];
  const safeCity =
    listing?.display_city ||
    listing?.displayCity ||
    listing?.city ||
    listing?.location_city ||
    listing?.locationCity ||
    null;
  const safeState =
    listing?.display_state ||
    listing?.displayState ||
    listing?.state ||
    listing?.location_state ||
    listing?.locationState ||
    null;
  const locationSummary = useMemo(() => {
    if (!safeCity && !safeState) {
      return null;
    }
    if (safeCity && safeState) {
      return `${safeCity}, ${safeState}`;
    }
    return safeCity || safeState || null;
  }, [safeCity, safeState]);
  const serviceZone = useMemo(() => {
    if (!listing) {
      return null;
    }
    const zone = listing.service_zone || listing.serviceZone || null;
    const type = zone?.type || listing?.service_zone_type || listing?.serviceZoneType || 'radius';
    const radiusValue =
      zone?.radius_miles ??
      zone?.radiusMiles ??
      listing?.service_radius_miles ??
      listing?.serviceRadiusMiles ??
      null;
    const label = zone?.label || listing?.display_zone_label || listing?.displayZoneLabel || null;

    return {
      type: type || 'radius',
      radiusMiles:
        typeof radiusValue === 'number'
          ? radiusValue
          : radiusValue != null && !Number.isNaN(Number(radiusValue))
            ? Number(radiusValue)
            : null,
      label: label || null,
    };
  }, [listing]);
  const serviceAreaDescription = useMemo(() => {
    if (serviceZone?.type === 'city_only') {
      return locationSummary
        ? `Serves events across ${locationSummary} and nearby neighborhoods.`
        : 'Serves events within the listed city.';
    }
    if (serviceZone?.radiusMiles && locationSummary) {
      return `Serves locations within ${serviceZone.radiusMiles} miles of ${locationSummary}.`;
    }
    if (serviceZone?.radiusMiles) {
      return `Serves locations within ${serviceZone.radiusMiles} miles of the host base location.`;
    }
    if (locationSummary) {
      return `Serves locations near ${locationSummary}.`;
    }
    return 'Service area details will be confirmed after booking.';
  }, [serviceZone, locationSummary]);
  const addOns = useMemo(() => {
    const raw = listing?.addOns || listing?.add_ons || [];
    if (Array.isArray(raw)) {
      return raw;
    }
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_error) {
        return [];
      }
    }
    return [];
  }, [listing?.addOns, listing?.add_ons]);
  // TODO: Once renters provide event addresses, validate them against the service zone before confirming availability.
  const hostUserId = extractHostUserId(listing);

  useEffect(() => {
    if (!hostUserId) {
      setHostProfile({ status: 'idle', data: null, error: '' });
      return;
    }

    let isActive = true;
    const fetchHost = async () => {
      setHostProfile({ status: 'loading', data: null, error: '' });
      try {
        const response = await fetch(`/api/users/me?userId=${hostUserId}`);
        const result = await response.json();
        if (!response.ok || !result?.data) {
          throw new Error(result?.error || 'Unable to load host profile');
        }
        if (isActive) {
          setHostProfile({ status: 'success', data: result.data, error: '' });
        }
      } catch (error) {
        if (isActive) {
          console.warn('Failed to fetch host profile', error);
          setHostProfile({ status: 'error', data: null, error: error.message || 'Unable to load host profile' });
        }
      }
    };

    fetchHost();

    return () => {
      isActive = false;
    };
  }, [hostUserId]);
  const createdAt = listing?.created_at || listing?.createdAt;
  const priceUnit = listing?.price_unit || listing?.priceUnit || 'per day';
  const rawType = listing?.listing_type || listing?.listingType || listing?.category;
  const normalizedType = normalizeValue(rawType);
  const isEventPro =
    normalizedType === 'event-pro' ||
    normalizedType === 'event_pro' ||
    normalizedType === 'eventpro' ||
    normalizedType === 'event';
  const bookingMode =
    normalizeValue(listing?.booking_mode || listing?.bookingMode || (isEventPro ? 'hourly' : 'daily-with-time')) ||
    'daily-with-time';
  const isHourlyMode = bookingMode === 'hourly';
  const bookingModeLabel = BOOKING_MODE_LABELS[bookingMode] || 'Daily rental';
  const { packages: eventProPackages = [] } = useEventProPackages(isEventPro && listing?.id ? listing.id : null);

  useEffect(() => {
    if (!selectedPackage) {
      return;
    }
    const stillExists = Array.isArray(eventProPackages)
      ? eventProPackages.some((pkg) => pkg.id === selectedPackage.id)
      : false;
    if (!stillExists) {
      setSelectedPackage(null);
    }
  }, [eventProPackages, selectedPackage]);

  const categoryBadgeLabel = useMemo(
    () => formatCategoryBadge(rawType, listing?.category),
    [rawType, listing?.category]
  );
  const listingTypeLabel = useMemo(
    () => formatListingType(rawType, listing?.category),
    [rawType, listing?.category]
  );
  const detailItems = useMemo(() => {
    const items = [
      { label: 'Type', value: listingTypeLabel },
      { label: 'Base price', value: formatPrice(listing?.price, priceUnit) },
      { label: 'City', value: safeCity || 'Shared after booking' },
      { label: 'State', value: safeState || 'Shared after booking' },
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

    items.push({ label: 'Booking mode', value: bookingModeLabel });

    const serviceRadiusLabel =
      serviceZone?.type === 'city_only'
        ? 'City-wide coverage'
        : serviceZone?.radiusMiles
          ? `${serviceZone.radiusMiles} mile radius`
          : 'Contact host';
    items.push({ label: 'Service radius', value: serviceRadiusLabel });

    return items;
  }, [
    createdAt,
    deliveryAvailable,
    isVerified,
    listing?.price,
    listingTypeLabel,
    priceUnit,
    bookingModeLabel,
    safeCity,
    safeState,
    serviceZone,
  ]);

  const formattedPrice = useMemo(
    () => formatPrice(listing?.price, priceUnit),
    [listing?.price, priceUnit]
  );

  const selectedPackageBasePrice = selectedPackage
    ? Number(selectedPackage.base_price ?? selectedPackage.basePrice ?? selectedPackage.price ?? 0)
    : null;
  const displayPrimaryPrice = selectedPackageBasePrice ? formatCurrency(selectedPackageBasePrice) : formattedPrice;

  const selectedEndDate = isHourlyMode ? startDate : endDate;
  const rentalDays = !isHourlyMode && startDate && endDate ? calculateSelectedDays(startDate, endDate) : 0;
  const durationHours = isHourlyMode && startDate && eventStartTime && eventEndTime ? calculateSelectedHours(startDate, eventStartTime, eventEndTime) : 0;
  const nightlyRate = Number(listing?.price) || 0;
  const estimatedTotalValue = isHourlyMode
    ? durationHours > 0 && nightlyRate > 0
      ? durationHours * nightlyRate
      : null
    : rentalDays > 0 && nightlyRate > 0
      ? rentalDays * nightlyRate
      : null;
  const estimatedTotal = estimatedTotalValue ? formatCurrency(estimatedTotalValue) : null;
  const hasRequiredSelection = isHourlyMode
    ? Boolean(startDate && eventStartTime && eventEndTime)
    : Boolean(startDate && selectedEndDate);
  const canSubmit = Boolean(hostUserId && isAuthenticated && hasRequiredSelection) && !isSubmitting;
  const hostRecord = hostProfile.data || null;
  const hostDisplayName =
    hostRecord?.display_name ||
    hostRecord?.business_name ||
    [hostRecord?.first_name, hostRecord?.last_name].filter(Boolean).join(' ').trim() ||
    listing?.host_name ||
    listing?.hostName ||
    'Vendibook Host';
  const hostTagline = hostRecord?.tagline || listing?.host_tagline || 'Trusted Vendibook operator';
  const hostLocation = hostRecord?.city && hostRecord?.state
    ? `${hostRecord.city}, ${hostRecord.state}`
    : hostRecord?.city || hostRecord?.state || locationSummary;
  const hostServiceArea = hostRecord?.service_area_description || serviceAreaDescription;
  const hostSpecialties = (hostRecord?.cuisines || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
  const hostInitials = buildInitials(hostDisplayName);
  const hostProfileLoading = hostProfile.status === 'loading';

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
                    {locationSummary || 'Location shared after booking'}
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
                    {eventProPackages.length === 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                        This Event Pro has not added packages yet — contact the host for custom pricing.
                      </div>
                    ) : (
                      eventProPackages.map((pkg) => {
                        const isActive = selectedPackage && selectedPackage.id === pkg.id;
                        const basePrice = Number(pkg.base_price ?? pkg.basePrice ?? pkg.price ?? 0);
                        return (
                          <div
                            key={pkg.id}
                            className={`rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
                              isActive ? 'ring-2 ring-orange-300 border-orange-200' : 'border-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{pkg.name}</p>
                                {pkg.max_guests || pkg.maxGuests ? (
                                  <p className="mt-1 text-xs text-slate-500">Up to {pkg.max_guests || pkg.maxGuests} guests</p>
                                ) : null}
                                {pkg.description ? (
                                  <p className="mt-2 text-sm text-slate-600 whitespace-pre-line">{pkg.description}</p>
                                ) : null}
                                {pkg.included_items || pkg.includedItems ? (
                                  <ul className="mt-2 list-disc list-inside text-sm text-slate-600">
                                    {String(pkg.included_items || pkg.includedItems).split('\n').map((line, idx) => (
                                      <li key={idx}>{line}</li>
                                    ))}
                                  </ul>
                                ) : null}
                                {pkg.duration_hours || pkg.durationHours ? (
                                  <p className="mt-2 text-xs text-slate-500">Typical service time, {pkg.duration_hours || pkg.durationHours} hours</p>
                                ) : null}
                              </div>

                              <div className="flex shrink-0 flex-col items-end gap-3">
                                <div className="text-sm font-semibold text-slate-900">{formatCurrency(basePrice) || 'Contact for pricing'}</div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedPackage(isActive ? null : pkg)}
                                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                    isActive ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50'
                                  }`}
                                >
                                  {isActive ? 'Selected' : 'Select package'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              </article>
            )}

            {addOns.length > 0 && (
              <article className="rounded-3xl bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
                <section>
                  <h2 className="text-lg font-semibold text-slate-900">Add-ons & Upgrades</h2>
                  <p className="mt-2 text-sm text-slate-600">Enhance the experience with curated extras the host offers.</p>
                  <div className="mt-5 space-y-4">
                    {addOns.map((addOn, index) => (
                      <div key={addOn.id || index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{addOn.name || 'Custom add-on'}</p>
                            {addOn.description ? (
                              <p className="mt-1 text-sm text-slate-600">{addOn.description}</p>
                            ) : null}
                          </div>
                          <div className="text-right">
                            <p className="text-base font-semibold text-slate-900">
                              {Number.isFinite(Number(addOn.price)) ? `$${Number(addOn.price).toLocaleString()}` : 'Contact'}
                            </p>
                            {addOn.priceType ? (
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{addOn.priceType.replace(/-/g, ' ')}</p>
                            ) : null}
                          </div>
                        </div>
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

            <article className="rounded-3xl bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-8">
              <section>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Service area</h2>
                  {serviceZone?.label && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      Service area, {serviceZone.label}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-600">{serviceAreaDescription}</p>
                <p className="mt-1 text-xs text-slate-500">Exact depot address is shared after booking confirmation.</p>
                {/* TODO: Capture renter event address and validate it against this service zone before confirming requests. */}
                <div className="mt-5">
                  <ListingMapPlaceholder city={safeCity} state={safeState} radiusMiles={serviceZone?.radiusMiles} />
                </div>
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
                <p className="mt-2 text-3xl font-bold text-slate-900">{displayPrimaryPrice}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {isEventPro ? 'Custom quotes available for larger activations.' : `Base rate ${priceUnit}`}
                </p>
                {selectedPackage ? (
                  <div className="mt-3 rounded-md border border-orange-100 bg-orange-50 px-3 py-2 text-sm">
                    <div className="font-semibold text-slate-900">Selected package: {selectedPackage.name}</div>
                    <div className="text-sm text-slate-700">Starting at {formatCurrency(Number(selectedPackage.base_price ?? selectedPackage.basePrice ?? selectedPackage.price ?? 0))}</div>
                  </div>
                ) : null}
                {locationSummary && (
                  <p className="mt-2 text-sm font-semibold text-slate-700">Pickup near {locationSummary}</p>
                )}
                {serviceZone?.radiusMiles && (
                  <p className="text-xs text-slate-500">Delivery available within {serviceZone.radiusMiles} miles</p>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {isHourlyMode ? 'Event availability' : 'Select your dates'}
                  </p>
                  <div className="mt-3">
                    <AvailabilityCalendar
                      listingId={listing.id}
                      bookingMode={bookingMode}
                      selectedStartDate={startDate}
                      selectedEndDate={selectedEndDate}
                      onChangeDates={(startSelection, endSelection) => {
                        setBookingFeedback(null);
                        setCalendarNotice(null);
                        setStartDate(startSelection);
                        setEndDate(isHourlyMode ? startSelection : endSelection);
                      }}
                    />
                    {calendarNotice && (
                      <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {calendarNotice}
                      </div>
                    )}
                  </div>
                </div>

                {isHourlyMode ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="event-start-time">
                        Event start time
                      </label>
                      <input
                        id="event-start-time"
                        type="time"
                        value={eventStartTime}
                        onChange={(e) => {
                          setEventStartTime(e.target.value);
                          setBookingFeedback(null);
                          setCalendarNotice(null);
                        }}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="event-end-time">
                        Event end time
                      </label>
                      <input
                        id="event-end-time"
                        type="time"
                        value={eventEndTime}
                        onChange={(e) => {
                          setEventEndTime(e.target.value);
                          setBookingFeedback(null);
                          setCalendarNotice(null);
                        }}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="pickup-time">
                        Pickup time
                      </label>
                      <input
                        id="pickup-time"
                        type="time"
                        value={pickupTime}
                        onChange={(e) => {
                          setPickupTime(e.target.value);
                          setBookingFeedback(null);
                          setCalendarNotice(null);
                        }}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="return-time">
                        Return time
                      </label>
                      <input
                        id="return-time"
                        type="time"
                        value={returnTime}
                        onChange={(e) => {
                          setReturnTime(e.target.value);
                          setBookingFeedback(null);
                          setCalendarNotice(null);
                        }}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                )}

                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p>
                    {isHourlyMode
                      ? durationHours > 0
                        ? `${durationHours.toFixed(1)} hrs selected`
                        : 'Select a date and event times'
                      : rentalDays > 0
                        ? `${rentalDays} day${rentalDays === 1 ? '' : 's'} selected`
                        : 'Select your trip dates'}
                  </p>
                  {estimatedTotal && (
                    <p className="mt-1 text-base font-semibold text-slate-900">Estimated total {estimatedTotal}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleBookNow}
                  disabled={!canSubmit}
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
                <p className="text-center text-xs text-slate-500">
                  Exact address and access instructions are shared after booking is confirmed.
                </p>
                {bookingFeedback && (
                  <div
                    className={`rounded-xl px-4 py-3 text-sm ${
                      bookingFeedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {bookingFeedback.message}
                  </div>
                )}
                {!isAuthenticated && (
                  <p className="text-center text-xs font-medium text-slate-500">
                    Sign in to request this listing and reserve your dates.
                  </p>
                )}
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

            {hostUserId ? (
              <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Hosted by</p>
                {hostProfileLoading ? (
                  <div className="mt-4 animate-pulse space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-slate-100" />
                      <div className="space-y-2">
                        <div className="h-3 w-32 rounded-full bg-slate-100" />
                        <div className="h-3 w-24 rounded-full bg-slate-100" />
                      </div>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-100" />
                    <div className="h-3 w-3/4 rounded-full bg-slate-100" />
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">
                        {hostProfile.status === 'error' ? <UserCircle className="h-7 w-7 text-white/70" /> : hostInitials}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-900">{hostDisplayName}</p>
                        {hostLocation ? <p className="text-sm text-slate-600">{hostLocation}</p> : null}
                      </div>
                    </div>
                    <p className="text-sm text-slate-700">{hostTagline}</p>
                    {hostServiceArea ? (
                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
                        <span className="font-semibold text-slate-900">Service area:</span> {hostServiceArea}
                      </div>
                    ) : null}
                    {hostSpecialties.length > 0 ? (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Specialties</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {hostSpecialties.map((specialty) => (
                            <span key={specialty} className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {hostProfile.status === 'error' ? (
                      <p className="text-xs text-rose-600">{hostProfile.error || 'Host details unavailable, please message the host for more info.'}</p>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Host identity badges sync from the Vendibook profile — updates here refresh automatically.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </aside>
        </section>
      </main>
    </div>
  );
}

export default ListingDetails;
