import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Check, 
  Shield, 
  Truck, 
  Calendar,
  Users,
  Bed,
  Bath,
  Wifi,
  Flame,
  Wind,
  Car,
  Tv,
  ChefHat,
  Droplets,
  Zap,
  Heart,
  Share2,
  Clock,
  DollarSign,
  ChevronRight,
  Phone,
  Mail,
  UserCircle
} from 'lucide-react';
import { getListingById as getMockListingById } from '../data/listings';
import { AvailabilityCalendar } from '../components/AvailabilityCalendar';
import { ListingMapPlaceholder } from '../components/ListingMapPlaceholder';
import { BookingCheckoutModal } from '../components/BookingCheckoutModal';
import { ReviewsSection } from '../components/ReviewsSection';
import { SaveButton } from '../components/SaveButton';
import { useEventProPackages } from '../hooks/useEventProPackages';
import { useAuth } from '../hooks/useAuth';
import { useAppStatus } from '../hooks/useAppStatus';
import { useAnalytics, ANALYTICS_EVENTS } from '../hooks/useAnalytics';
import AppLayout from '../layouts/AppLayout';

// Amenity icon mapping
const AMENITY_ICONS = {
  wifi: Wifi,
  heater: Flame,
  fireplace: Flame,
  'hot tub': Droplets,
  tv: Tv,
  parking: Car,
  'full kitchen': ChefHat,
  'game room': Tv,
  refrigerator: ChefHat,
  power: Zap,
  water: Droplets,
  generator: Zap,
  ventilation: Wind,
  default: Check
};

const getAmenityIcon = (amenity) => {
  const key = amenity.toLowerCase();
  for (const [match, icon] of Object.entries(AMENITY_ICONS)) {
    if (key.includes(match)) return icon;
  }
  return AMENITY_ICONS.default;
};

const normalizeValue = (value) => (value ? value.toString().toLowerCase() : '');

const formatListingType = (type, category) => {
  const normalizedType = normalizeValue(type || category);
  switch (normalizedType) {
    case 'food-truck':
    case 'food_truck':
    case 'foodtrucks':
      return 'Food Truck';
    case 'trailer':
    case 'trailers':
      return 'Food Trailer';
    case 'ghost-kitchen':
    case 'ghost_kitchen':
      return 'Ghost Kitchen';
    case 'event-pro':
    case 'event_pro':
    case 'eventpro':
      return 'Event Pro';
    case 'vending-lots':
    case 'vending_lots':
      return 'Vendor Space';
    case 'for-sale':
    case 'for_sale':
      return 'For Sale';
    default:
      return (type || category || 'Listing').toString();
  }
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

const formatTimePreset = (value) => {
  if (!value) return '';
  const parts = String(value).split(':');
  const hours = parts[0]?.padStart(2, '0') || '00';
  const minutes = parts[1]?.padStart(2, '0') || '00';
  return `${hours}:${minutes}`;
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

function ListingDetailRedesigned() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { track, trackBookingFunnel } = useAnalytics();
  
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
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [hostProfile, setHostProfile] = useState({ status: 'idle', data: null, error: '' });
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Fetch listing data
  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    const controller = new AbortController();

    const fetchListing = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let record = null;

        // Try API endpoint first
        try {
          const response = await fetch(`/api/listings?id=${encodeURIComponent(id)}`, {
            signal: controller.signal,
          });

          if (response.ok) {
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

        // Fallback to explicit ID route
        if (!record) {
          const fallbackResponse = await fetch(`/api/listings/${encodeURIComponent(id)}`, {
            signal: controller.signal,
          });

          if (fallbackResponse.status === 404) {
            throw new Error('Listing not found');
          }

          if (fallbackResponse.ok) {
            try {
              record = await fallbackResponse.json();
            } catch (jsonError) {
              throw new Error('Listing not found');
            }
          }
        }

        // Final fallback to mock data
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
          track(ANALYTICS_EVENTS.LISTING_VIEWED, {
            listingId: record.id,
            title: record.title,
            category: record.listing_type || record.category,
            price: record.price
          });
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
  }, [id, reloadKey, track]);

  // Reset form when listing changes
  useEffect(() => {
    setStartDate(null);
    setEndDate(null);
    setPickupTime(formatTimePreset(listing?.default_start_time || listing?.defaultStartTime));
    setReturnTime(formatTimePreset(listing?.default_end_time || listing?.defaultEndTime));
    setEventStartTime('');
    setEventEndTime('');
    setBookingFeedback(null);
    setSelectedPackage(null);
  }, [listing?.id]);

  // Fetch host profile
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
          setHostProfile({ status: 'error', data: null, error: error.message });
        }
      }
    };

    fetchHost();
    return () => { isActive = false; };
  }, [hostUserId]);

  // Derived values
  const imageUrl = listing?.imageUrl || listing?.image_url;
  const imageUrls = listing?.imageUrls || listing?.image_urls || (imageUrl ? [imageUrl] : []);
  const deliveryAvailable = listing?.deliveryAvailable || listing?.delivery_available;
  const isVerified = listing?.isVerified || listing?.is_verified;
  const tags = Array.isArray(listing?.tags) ? listing.tags : [];
  const highlights = Array.isArray(listing?.highlights) ? listing.highlights : [];
  const amenities = listing?.amenities || listing?.features || tags;
  
  const safeCity = listing?.display_city || listing?.displayCity || listing?.city || null;
  const safeState = listing?.display_state || listing?.displayState || listing?.state || null;
  const locationSummary = useMemo(() => {
    if (!safeCity && !safeState) return null;
    if (safeCity && safeState) return `${safeCity}, ${safeState}`;
    return safeCity || safeState || null;
  }, [safeCity, safeState]);

  const serviceZone = useMemo(() => {
    if (!listing) return null;
    const zone = listing.service_zone || listing.serviceZone || null;
    const type = zone?.type || listing?.service_zone_type || listing?.serviceZoneType || 'radius';
    const radiusValue = zone?.radius_miles ?? zone?.radiusMiles ?? listing?.service_radius_miles ?? listing?.serviceRadiusMiles ?? null;
    return {
      type: type || 'radius',
      radiusMiles: typeof radiusValue === 'number' ? radiusValue : radiusValue != null ? Number(radiusValue) : null,
      label: zone?.label || listing?.display_zone_label || null,
    };
  }, [listing]);

  const rawType = listing?.listing_type || listing?.listingType || listing?.category;
  const normalizedType = normalizeValue(rawType);
  const isEventPro = ['event-pro', 'event_pro', 'eventpro', 'event'].includes(normalizedType);
  const bookingMode = normalizeValue(listing?.booking_mode || listing?.bookingMode || (isEventPro ? 'hourly' : 'daily-with-time')) || 'daily-with-time';
  const isHourlyMode = bookingMode === 'hourly';

  const { packages: eventProPackages = [] } = useEventProPackages(isEventPro && listing?.id ? listing.id : null);

  const priceUnit = listing?.price_unit || listing?.priceUnit || 'per night';
  const listingTypeLabel = formatListingType(rawType, listing?.category);
  
  const selectedEndDate = isHourlyMode ? startDate : endDate;
  const rentalDays = !isHourlyMode && startDate && endDate ? calculateSelectedDays(startDate, endDate) : 0;
  const durationHours = isHourlyMode && startDate && eventStartTime && eventEndTime ? calculateSelectedHours(startDate, eventStartTime, eventEndTime) : 0;
  const nightlyRate = Number(listing?.price) || 0;
  const estimatedTotalValue = isHourlyMode
    ? durationHours > 0 && nightlyRate > 0 ? durationHours * nightlyRate : null
    : rentalDays > 0 && nightlyRate > 0 ? rentalDays * nightlyRate : null;
  const estimatedTotal = estimatedTotalValue ? formatCurrency(estimatedTotalValue) : null;
  const hasRequiredSelection = isHourlyMode ? Boolean(startDate && eventStartTime && eventEndTime) : Boolean(startDate && selectedEndDate);
  const canSubmit = Boolean(hostUserId && isAuthenticated && hasRequiredSelection) && !isSubmitting;

  const hostRecord = hostProfile.data || null;
  const hostDisplayName = hostRecord?.display_name || hostRecord?.business_name || 
    [hostRecord?.first_name, hostRecord?.last_name].filter(Boolean).join(' ').trim() ||
    listing?.host_name || listing?.hostName || 'Vendibook Host';
  const hostInitials = buildInitials(hostDisplayName);

  const formatPrice = (price, unit = 'per night') => {
    if (price === undefined || price === null) return 'Contact for pricing';
    const value = Number(price);
    const formatted = Number.isFinite(value) ? formatCurrency(value) : price;
    return `${formatted} ${unit}`;
  };

  const retryFetch = () => {
    setListing(null);
    setError(null);
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  const handleBookNow = async () => {
    if (!listing?.id) return;

    const renterUserId = user?.id || user?._id || user?.userId;

    if (!isAuthenticated || !renterUserId) {
      setBookingFeedback({ type: 'error', message: 'Please sign in to request a booking.' });
      return;
    }

    if (!hostUserId) {
      setBookingFeedback({ type: 'error', message: 'Host information is missing for this listing.' });
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

    setBookingFeedback(null);
    setShowCheckoutModal(true);
    
    trackBookingFunnel('checkout_started', listing.id, {
      price: listing.price,
      days: rentalDays,
      hours: durationHours,
      isHourly: isHourlyMode
    });
  };

  const handleMessageHost = async () => {
    setBookingFeedback(null);

    if (!isAuthenticated || !user?.id) {
      const returnUrl = `/messages/info?listingId=${listing?.id}`;
      navigate(`/signin?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    try {
      const response = await fetch(`/api/messages/canStartThread?listingId=${listing?.id}&userId=${user.id}`);
      const data = await response.json();

      if (data.allowed && data.threadId) {
        navigate(`/messages/${data.threadId}`);
      } else {
        navigate(`/messages/info?listingId=${listing?.id}`);
      }
    } catch (error) {
      setBookingFeedback({
        type: 'error',
        message: 'Unable to check messaging eligibility. Please try again.'
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
            <p className="text-slate-600 font-medium">Loading listing...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error || !listing) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Listing Not Found</h1>
            <p className="text-slate-600 mb-8">
              {error || "We couldn't find the listing you're looking for."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={retryFetch}
                className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/listings')}
                className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
              >
                Browse Listings
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Full-width Hero Image */}
      <section className="relative h-[50vh] min-h-[400px] max-h-[600px] bg-slate-900">
        {/* Background Image */}
        <div className="absolute inset-0">
          {imageUrls.length > 0 ? (
            <img
              src={imageUrls[activeImageIndex] || imageUrls[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
              <span className="text-9xl">🚚</span>
            </div>
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        {/* Back Button & Actions */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate('/listings')}
              className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white rounded-xl text-slate-700 font-medium transition-colors shadow-md"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSaved(!isSaved)}
                className="p-3 bg-white/90 hover:bg-white rounded-xl transition-colors shadow-md"
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} />
              </button>
              <button className="p-3 bg-white/90 hover:bg-white rounded-xl transition-colors shadow-md">
                <Share2 className="w-5 h-5 text-slate-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 pb-8">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full">
                {listingTypeLabel}
              </span>
              {isVerified && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">
                  <Shield className="w-4 h-4" />
                  Verified
                </span>
              )}
              {deliveryAvailable && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white text-sm font-semibold rounded-full">
                  <Truck className="w-4 h-4" />
                  Delivery Available
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
              {listing.title}
            </h1>
            
            {/* Subtitle info */}
            <p className="text-lg text-white/80 max-w-2xl">
              {listing.description?.substring(0, 150) || 'Premium rental available for your next event or project.'}
              {listing.description?.length > 150 && '...'}
            </p>
          </div>
        </div>

        {/* Image Gallery Dots (if multiple images) */}
        {imageUrls.length > 1 && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            {imageUrls.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  activeImageIndex === index ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Quick Stats Bar */}
      <section className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-6">
            {/* Stats */}
            <div className="flex items-center gap-6 flex-wrap">
              {listing.guests && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">{listing.guests} Guests</span>
                </div>
              )}
              {listing.bedrooms && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Bed className="w-5 h-5" />
                  <span className="font-medium">{listing.bedrooms} Bedrooms</span>
                </div>
              )}
              {listing.bathrooms && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Bath className="w-5 h-5" />
                  <span className="font-medium">{listing.bathrooms} Bathrooms</span>
                </div>
              )}
              {locationSummary && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">{locationSummary}</span>
                </div>
              )}
            </div>

            {/* Price (mobile) */}
            <div className="ml-auto lg:hidden">
              <span className="text-xl font-bold text-slate-900">
                {formatPrice(listing.price, priceUnit)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Left Column - Details */}
          <div className="space-y-10">
            {/* About Section */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">About the {listingTypeLabel.toLowerCase()}</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {listing.description || 'Contact the host to learn more about this listing.'}
              </p>
              
              {/* Highlights as bullet points */}
              {highlights.length > 0 && (
                <ul className="mt-6 space-y-3">
                  {highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                      <span className="text-slate-600">{highlight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Amenities/Features Grid */}
            {amenities.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Room amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {amenities.map((amenity, index) => {
                    const Icon = getAmenityIcon(amenity);
                    return (
                      <div key={index} className="flex items-center gap-3 text-slate-600">
                        <Icon className="w-5 h-5 text-slate-400" />
                        <span className="font-medium">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Event Pro Packages */}
            {isEventPro && eventProPackages.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Packages & Pricing</h2>
                <div className="space-y-4">
                  {eventProPackages.map((pkg) => {
                    const isActive = selectedPackage?.id === pkg.id;
                    const basePrice = Number(pkg.base_price ?? pkg.basePrice ?? pkg.price ?? 0);
                    return (
                      <div
                        key={pkg.id}
                        className={`rounded-xl border-2 p-5 transition-all cursor-pointer ${
                          isActive 
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => setSelectedPackage(isActive ? null : pkg)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-slate-900">{pkg.name}</h3>
                            {(pkg.max_guests || pkg.maxGuests) && (
                              <p className="text-sm text-slate-500 mt-1">Up to {pkg.max_guests || pkg.maxGuests} guests</p>
                            )}
                            {pkg.description && (
                              <p className="text-sm text-slate-600 mt-2">{pkg.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">{formatCurrency(basePrice)}</p>
                            {isActive && (
                              <span className="text-sm text-orange-600 font-medium">Selected</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Location Section */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Location</h2>
              <p className="text-slate-600 mb-4">
                {serviceZone?.radiusMiles 
                  ? `Serves locations within ${serviceZone.radiusMiles} miles of ${locationSummary || 'the base location'}.`
                  : locationSummary 
                    ? `Based in ${locationSummary}.`
                    : 'Exact location shared after booking confirmation.'
                }
              </p>
              <div className="rounded-xl overflow-hidden">
                <ListingMapPlaceholder city={safeCity} state={safeState} radiusMiles={serviceZone?.radiusMiles} />
              </div>
            </section>

            {/* Reviews Section */}
            {listing?.id && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Reviews</h2>
                <ReviewsSection listingId={listing.id} />
              </section>
            )}

            {/* Host Section */}
            <section className="border-t border-slate-200 pt-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Meet your host</h2>
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {hostInitials}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{hostDisplayName}</h3>
                  <p className="text-slate-500 mt-1">
                    {hostRecord?.tagline || listing?.host_tagline || 'Trusted Vendibook operator'}
                  </p>
                  {hostRecord?.city && hostRecord?.state && (
                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {hostRecord.city}, {hostRecord.state}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      onClick={handleMessageHost}
                      className="px-5 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Contact host
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Booking Card (Sticky) */}
          <div className="lg:block hidden">
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
              {/* Reserve Room Header */}
              <div className="border-b border-slate-200 pb-5 mb-5">
                <h3 className="text-xl font-bold text-slate-900">Reserve {listingTypeLabel.toLowerCase()}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {listing.description?.substring(0, 80) || 'Book now to secure your dates.'}
                  {listing.description?.length > 80 && '...'}
                </p>
              </div>

              {/* Price Display */}
              <div className="mb-5">
                <p className="text-sm text-slate-500">From</p>
                <p className="text-3xl font-bold text-slate-900">
                  {formatCurrency(listing.price) || 'Contact'}
                  <span className="text-base font-normal text-slate-500 ml-1">/{priceUnit.replace('per ', '')}</span>
                </p>
              </div>

              {/* Date Selection */}
              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {isHourlyMode ? 'Event date' : 'Select dates'}
                  </label>
                  <AvailabilityCalendar
                    listingId={listing.id}
                    bookingMode={bookingMode}
                    selectedStartDate={startDate}
                    selectedEndDate={selectedEndDate}
                    onChangeDates={(start, end) => {
                      setBookingFeedback(null);
                      setStartDate(start);
                      setEndDate(isHourlyMode ? start : end);
                    }}
                  />
                </div>

                {/* Time Selection */}
                {isHourlyMode ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Start time</label>
                      <input
                        type="time"
                        value={eventStartTime}
                        onChange={(e) => setEventStartTime(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">End time</label>
                      <input
                        type="time"
                        value={eventEndTime}
                        onChange={(e) => setEventEndTime(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Pickup</label>
                      <input
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Return</label>
                      <input
                        type="time"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Estimated Total */}
              {(rentalDays > 0 || durationHours > 0) && (
                <div className="bg-slate-50 rounded-xl p-4 mb-5">
                  <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
                    <span>
                      {isHourlyMode 
                        ? `${durationHours.toFixed(1)} hours selected`
                        : `${rentalDays} night${rentalDays === 1 ? '' : 's'} selected`
                      }
                    </span>
                  </div>
                  {estimatedTotal && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-900">Estimated total</span>
                      <span className="text-lg font-bold text-slate-900">{estimatedTotal}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleBookNow}
                disabled={!canSubmit}
                className="w-full py-3.5 border-2 border-slate-900 text-slate-900 font-semibold rounded-xl hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                Add to Cart
              </button>

              {/* OR Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-sm text-slate-400">OR</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Book Now Button */}
              <button
                onClick={handleBookNow}
                disabled={!canSubmit}
                className="w-full py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Book on Vendibook
              </button>

              {/* Feedback Message */}
              {bookingFeedback && (
                <div className={`mt-4 px-4 py-3 rounded-xl text-sm ${
                  bookingFeedback.type === 'error' 
                    ? 'bg-red-50 text-red-700' 
                    : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {bookingFeedback.message}
                </div>
              )}

              {!isAuthenticated && (
                <p className="mt-4 text-center text-sm text-slate-500">
                  <Link to="/signin" className="text-orange-500 font-medium hover:underline">
                    Sign in
                  </Link> to request this listing
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-30">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xl font-bold text-slate-900">
              {formatCurrency(listing.price) || 'Contact'}
            </p>
            <p className="text-sm text-slate-500">{priceUnit}</p>
          </div>
          <button
            onClick={handleBookNow}
            disabled={!hasRequiredSelection && !isAuthenticated}
            className="flex-1 max-w-[200px] py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-60"
          >
            Reserve
          </button>
        </div>
      </div>

      {/* Booking Checkout Modal */}
      <BookingCheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        listing={listing}
        initialStartDate={startDate}
        initialEndDate={selectedEndDate}
        initialBookingMode={bookingMode}
        initialPickupTime={pickupTime}
        initialReturnTime={returnTime}
        initialEventStartTime={eventStartTime}
        initialEventEndTime={eventEndTime}
      />
    </div>
  );
}

export default ListingDetailRedesigned;
