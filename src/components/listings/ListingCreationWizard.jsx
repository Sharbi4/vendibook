import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  ArrowRight,
  Check,
  Camera,
  Copy,
  Download,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Video
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { buildListingPath, buildShareUrl, formatListingTypeLabel } from '../../utils/listingRoutes';

export const ListingWizardContext = createContext(null);

export const useListingWizard = () => {
  const context = useContext(ListingWizardContext);
  if (!context) {
    throw new Error('useListingWizard must be used within ListingWizardContext');
  }
  return context;
};

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const formatUSD = (value) => {
  if (value === null || value === undefined) return '';
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return '';
  }
  return usdFormatter.format(parsed);
};

const buildDisplayValue = (value, fallback) => ({
  text: value || fallback,
  isPlaceholder: !value
});

const resolvePrimaryPrice = (data) => {
  if (!data) return null;

  const toNumber = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const pricing = data.pricing || {};
  const packages = Array.isArray(pricing.packages) ? pricing.packages : [];

  if ((data.listingType || '').toLowerCase().includes('event')) {
    for (const pkg of packages) {
      const possible = toNumber(pkg?.price);
      if (possible) {
        return possible;
      }
    }
    const hourlyRate = toNumber(pricing.hourlyRate);
    if (hourlyRate) return hourlyRate;
  }

  return (
    toNumber(pricing.baseDailyRate) ??
    toNumber(pricing.weekendRate) ??
    toNumber(pricing.weeklyRate) ??
    toNumber(pricing.hourlyRate) ??
    null
  );
};

const mapWizardListingType = (value) => {
  const normalized = (value || '').toString().trim().toLowerCase();
  if (normalized.includes('event')) return 'EVENT_PRO';
  if (normalized.includes('sale')) return 'SALE';
  return 'RENT';
};

const mapApiListingTypeToWizard = (value) => {
  const normalized = (value || '').toString().trim().toUpperCase();
  if (normalized === 'EVENT_PRO') return 'eventPro';
  return 'rental';
};

const toTimeInputValue = (value, fallback) => {
  if (!value) return fallback;
  const stringValue = value.toString();
  if (!stringValue.includes(':')) {
    return fallback;
  }
  return stringValue.slice(0, 5);
};

const hydrateFormDataFromListing = (listing) => {
  if (!listing) return INITIAL_FORM_DATA;

  const serviceZone = listing.service_zone || {};
  const radiusValue =
    typeof serviceZone.radius_miles === 'number'
      ? serviceZone.radius_miles
      : typeof listing.service_radius_miles === 'number'
        ? listing.service_radius_miles
        : INITIAL_FORM_DATA.basics.serviceRadius;

  return {
    ...INITIAL_FORM_DATA,
    listingType: mapApiListingTypeToWizard(listing.listing_type || listing.listingType),
    basics: {
      ...INITIAL_FORM_DATA.basics,
      title: listing.title || '',
      category: listing.category || INITIAL_FORM_DATA.basics.category,
      subcategory: listing.subcategory || INITIAL_FORM_DATA.basics.subcategory,
      city: listing.city || '',
      state: listing.state || '',
      serviceRadius: radiusValue,
      serviceLabel: serviceZone.label || listing.display_zone_label || ''
    },
    schedule: {
      ...INITIAL_FORM_DATA.schedule,
      bookingMode: listing.booking_mode || listing.bookingMode || INITIAL_FORM_DATA.schedule.bookingMode,
      defaultPickupTime: toTimeInputValue(listing.default_start_time, INITIAL_FORM_DATA.schedule.defaultPickupTime),
      defaultReturnTime: toTimeInputValue(listing.default_end_time, INITIAL_FORM_DATA.schedule.defaultReturnTime),
      earliestStartTime: toTimeInputValue(listing.default_start_time, INITIAL_FORM_DATA.schedule.earliestStartTime),
      latestEndTime: toTimeInputValue(listing.default_end_time, INITIAL_FORM_DATA.schedule.latestEndTime)
    },
    pricing: {
      ...INITIAL_FORM_DATA.pricing,
      baseDailyRate: listing.price ? String(listing.price) : '',
      hourlyRate: listing.hourly_rate ? String(listing.hourly_rate) : INITIAL_FORM_DATA.pricing.hourlyRate,
      packages: (INITIAL_FORM_DATA.pricing.packages || []).map(pkg => ({ ...pkg }))
    },
    addOns: (INITIAL_FORM_DATA.addOns || []).map(addOn => ({ ...addOn })),
    notes: listing.description || '',
    eventProProfile: {
      ...INITIAL_EVENT_PRO_PROFILE,
      businessName: listing.business_name || listing.display_name || '',
      displayName: listing.display_name || '',
      city: listing.city || '',
      state: listing.state || '',
      serviceAreaDescription: listing.service_area_description || INITIAL_EVENT_PRO_PROFILE.serviceAreaDescription
    },
    eventProPackages: Array.isArray(listing.event_pro_packages)
      ? listing.event_pro_packages.map((pkg) => ({
          id: pkg.id || createId(),
          name: pkg.name || '',
          description: pkg.description || '',
          servesCount: pkg.servesCount || pkg.serves_count || '',
          basePrice: pkg.basePrice || pkg.base_price || '',
          priceUnit: pkg.priceUnit || pkg.price_unit || 'per_event',
          imageUrl: pkg.imageUrl || pkg.image_url || '',
          addOns: Array.isArray(pkg.addOns)
            ? pkg.addOns.map((addOn) => ({
                id: addOn.id || createId(),
                name: addOn.name || '',
                description: addOn.description || '',
                price: addOn.price || '',
                priceUnit: addOn.priceUnit || addOn.price_unit || 'per_event'
              }))
            : []
        }))
      : [createEventProPackage()],
    eventProLogistics: {
      ...INITIAL_EVENT_PRO_LOGISTICS,
      serviceRadiusMiles: listing.service_radius_miles || INITIAL_EVENT_PRO_LOGISTICS.serviceRadiusMiles
    }
  };
};

const createId = () => (
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10)
);

const EVENT_PRO_SERVICE_TYPES = [
  'Catering',
  'Bartender',
  'Candy bar',
  'DJ',
  'Photo booth',
  'Coffee cart',
  'Other'
];

const EVENT_PRO_PRICE_UNITS = [
  { value: 'per_event', label: 'Per event' },
  { value: 'per_hour', label: 'Per hour' },
  { value: 'per_person', label: 'Per person' }
];

const EVENT_PRO_TRAVEL_POLICIES = [
  { value: 'included_within_radius', label: 'Included within radius' },
  { value: 'travel_fee_beyond_radius', label: 'Travel fee beyond radius' },
  { value: 'custom_quote', label: 'Custom quote' }
];

const RENTAL_STEP_CONFIG = [
  { key: 'type', label: 'Listing type', description: 'Tell us what you offer' },
  { key: 'basics', label: 'Basics', description: 'Location & positioning' },
  { key: 'schedule', label: 'Schedule', description: 'Booking availability' },
  { key: 'pricing', label: 'Pricing & packages', description: 'Rates and offerings' },
  { key: 'media', label: 'Media', description: 'Photos & video' },
  { key: 'documents', label: 'Documents', description: 'Compliance & proof' },
  { key: 'addOns', label: 'Add-ons', description: 'Upsells & extras' },
  { key: 'preview', label: 'Preview', description: 'Review & publish' }
];

const EVENT_PRO_STEP_CONFIG = [
  { key: 'type', label: 'Listing type', description: 'Tell us what you offer' },
  { key: 'eventProIntro', label: 'Event Pro intro', description: 'What to expect' },
  { key: 'eventProProfile', label: 'Event Pro profile', description: 'Identity & positioning' },
  { key: 'eventProPackages', label: 'Packages', description: 'Curate offerings' },
  { key: 'eventProLogistics', label: 'Logistics', description: 'Service coverage' },
  { key: 'media', label: 'Media', description: 'Photos & video' },
  { key: 'documents', label: 'Documents', description: 'Compliance & proof' },
  { key: 'addOns', label: 'Add-ons', description: 'Upsells & extras' },
  { key: 'preview', label: 'Preview', description: 'Review & publish' }
];

const RENTAL_CATEGORIES = [
  { value: 'food-truck', label: 'Food truck' },
  { value: 'food-trailer', label: 'Food trailer' },
  { value: 'ghost-kitchen', label: 'Ghost kitchen' },
  { value: 'vending-lot', label: 'Vending lot / pop-up space' }
];

const EVENT_PRO_CATEGORIES = [
  { value: 'catering', label: 'Catering team' },
  { value: 'dessert-bar', label: 'Dessert or candy bar' },
  { value: 'bartending', label: 'Mobile bartending' },
  { value: 'beverage-cart', label: 'Coffee / tea cart' },
  { value: 'experience', label: 'Interactive experience' }
];

const STATE_OPTIONS = ['AZ', 'CA', 'NV', 'NY', 'TX', 'WA'];
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_PACKAGE = () => ({
  id: createId(),
  name: '',
  description: '',
  guestCount: '',
  inclusions: '',
  price: ''
});

const DEFAULT_ADD_ON = () => ({
  id: createId(),
  name: '',
  description: '',
  price: '',
  priceType: 'per-booking'
});

const createEventProPackage = () => ({
  id: createId(),
  name: '',
  description: '',
  servesCount: '',
  basePrice: '',
  priceUnit: 'per_event',
  imageUrl: '',
  addOns: []
});

const createEventProPackageAddOn = () => ({
  id: createId(),
  name: '',
  description: '',
  price: '',
  priceUnit: 'per_event'
});

const INITIAL_EVENT_PRO_PROFILE = {
  serviceType: '',
  businessName: '',
  displayName: '',
  tagline: '',
  city: '',
  state: '',
  serviceAreaDescription: '',
  offersOnsiteService: true,
  offersPickup: false
};

const INITIAL_EVENT_PRO_LOGISTICS = {
  serviceRadiusMiles: 25,
  travelPolicy: 'included_within_radius',
  providesStaffOnsite: true,
  includesSetupAndBreakdown: true,
  acceptsLastMinuteBookings: false
};

const buildEventProLogisticsSummary = (logistics, schedule = INITIAL_FORM_DATA.schedule) => {
  if (!logistics) return '';
  const parts = [];
  if (logistics.serviceRadiusMiles) {
    parts.push(`Serves within ${logistics.serviceRadiusMiles} miles`);
  }
  if (logistics.travelPolicy === 'travel_fee_beyond_radius') {
    parts.push('Travel fee beyond radius');
  } else if (logistics.travelPolicy === 'custom_quote') {
    parts.push('Custom travel quotes');
  } else if (logistics.travelPolicy === 'included_within_radius') {
    parts.push('Travel included nearby');
  }
  if (logistics.providesStaffOnsite) {
    parts.push('Team provided onsite');
  }
  if (logistics.includesSetupAndBreakdown) {
    parts.push('Setup & breakdown handled');
  }
  if (logistics.acceptsLastMinuteBookings) {
    parts.push('Last-minute friendly');
  }
  if (schedule?.eventDurationHours) {
    parts.push(`${schedule.eventDurationHours}-hour activations`);
  }
  if (schedule?.earliestStartTime && schedule?.latestEndTime) {
    parts.push(`${schedule.earliestStartTime}–${schedule.latestEndTime}`);
  }
  if (schedule?.availableDays?.length) {
    const totalDays = schedule.availableDays.length;
    const previewDays = schedule.availableDays.slice(0, 3).map((day) => day.substring(0, 3)).join(', ');
    parts.push(totalDays === 7 ? 'Available daily' : `Available ${previewDays}${totalDays > 3 ? '…' : ''}`);
  }
  return parts.join(' • ');
};

const INITIAL_FORM_DATA = {
  listingType: '',
  basics: {
    title: '',
    category: '',
    subcategory: '',
    city: '',
    state: '',
    serviceRadius: 15,
    serviceLabel: ''
  },
  schedule: {
    bookingMode: '',
    defaultPickupTime: '08:00',
    defaultReturnTime: '20:00',
    minRentalDays: 1,
    maxRentalDays: 3,
    availabilitySummary: '',
    eventDurationHours: 4,
    earliestStartTime: '08:00',
    latestEndTime: '22:00',
    availableDays: []
  },
  pricing: {
    baseDailyRate: '',
    weekendRate: '',
    weeklyRate: '',
    cleaningFee: '',
    deliveryAvailable: false,
    deliveryIncludedMiles: '',
    deliveryPerMileFee: '',
    packages: [DEFAULT_PACKAGE()],
    hourlyRate: '',
    hourlyMinimumHours: ''
  },
  media: {
    coverPreview: '',
    gallery: [],
    videoUrl: ''
  },
  documents: {
    hasInsurance: false,
    hasPermits: false,
    agreesToTerms: false,
    insuranceName: '',
    permitName: '',
    licenseName: ''
  },
  addOns: [DEFAULT_ADD_ON()],
  notes: '',
  eventProProfile: { ...INITIAL_EVENT_PRO_PROFILE },
  eventProPackages: [createEventProPackage()],
  eventProLogistics: { ...INITIAL_EVENT_PRO_LOGISTICS }
};

function ListingCreationWizard({ onClose, mode = 'create', initialData = null, listingId: listingIdProp = null }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(() => INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState({ status: 'idle', errorMessage: '', listing: null, shareUrl: '' });
  const [viewMode, setViewMode] = useState('editing');
  const [inlineNotice, setInlineNotice] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');
  const qrCanvasRef = useRef(null);
  const copyTimeoutRef = useRef(null);
  const derivedMode = initialData || listingIdProp ? 'edit' : mode;
  const isEditMode = derivedMode === 'edit';
  const isEventProListing = formData.listingType === 'eventPro' || formData.listingType === 'event_pro';
  const stepConfig = isEventProListing ? EVENT_PRO_STEP_CONFIG : RENTAL_STEP_CONFIG;
  const totalSteps = stepConfig.length;
  const activeStep = stepConfig[currentStep] || stepConfig[0];
  const activeStepKey = activeStep?.key || stepConfig[0].key;
  const isTypeStepActive = activeStepKey === 'type';
  const isContinueDisabled = currentStep === totalSteps - 1 || (isTypeStepActive && !formData.listingType);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!initialData) return;
    setFormData(hydrateFormDataFromListing(initialData));
    setCurrentStep(0);
    setViewMode('editing');
    setSubmissionState({ status: 'idle', errorMessage: '', listing: null, shareUrl: '' });
    setInlineNotice('');
    setCopyFeedback('');
  }, [initialData]);

  const contextValue = useMemo(() => ({ formData, setFormData }), [formData]);

  useEffect(() => {
    setCurrentStep((prev) => Math.min(prev, totalSteps - 1));
  }, [totalSteps]);

  const derivedPreview = useMemo(() => {
    const {
      basics,
      schedule,
      pricing,
      media,
      addOns,
      listingType,
      eventProProfile,
      eventProPackages,
      eventProLogistics
    } = formData;
    const isEventPro = listingType === 'eventPro' || listingType === 'event_pro';
    const profile = eventProProfile || INITIAL_EVENT_PRO_PROFILE;
    const logistics = eventProLogistics || INITIAL_EVENT_PRO_LOGISTICS;
    const baseCityState = [basics.city, basics.state].filter(Boolean).join(', ');
    const profileCityState = [profile.city || basics.city, profile.state || basics.state].filter(Boolean).join(', ');
    const previewLocationText = isEventPro ? profileCityState || baseCityState : baseCityState;
    const serviceRadius = isEventPro
      ? Number(logistics.serviceRadiusMiles || basics.serviceRadius)
      : basics.serviceRadius;
    const trimmedServiceLabel = isEventPro
      ? profile.serviceAreaDescription?.trim() || basics.serviceLabel?.trim() || ''
      : basics.serviceLabel?.trim() || '';
    const hasRadius = Boolean(serviceRadius);
    const serviceAreaText = trimmedServiceLabel
      ? trimmedServiceLabel
      : hasRadius && previewLocationText
        ? `Serves locations within ${serviceRadius} miles of ${previewLocationText}`
        : '';

    const primaryMedia = media.coverPreview || media.gallery?.[0]?.preview || '';
    const fallbackImage = isEventPro
      ? 'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=900&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1505471768190-0af6755fab1c?w=900&auto=format&fit=crop&q=80';

    const heroImage = primaryMedia || fallbackImage;
    const primaryPrice = resolvePrimaryPrice(formData);
    const formattedPrice = formatUSD(primaryPrice);

    const bookingModeLookup = {
      daily: 'Daily rental',
      'daily-with-time': 'Daily rental with pickup & return times',
      hourly: 'Hourly rental',
      'event-pro': 'Event Pro booking',
      'per-event': 'Event Pro booking',
      'package': 'Package-based event'
    };

    const bookingModeKey = schedule.bookingMode || (isEventPro ? 'event-pro' : 'daily');
    const bookingModeLabel = bookingModeLookup[bookingModeKey] || 'Rental mode not set';

    const packageSource = isEventPro ? (eventProPackages || []) : (pricing.packages || []);
    const previewPackages = packageSource.map((pkg) => {
      const name = pkg.name || pkg.title || '';
      const description = pkg.description || pkg.summary || '';
      const priceValue = isEventPro ? pkg.basePrice : pkg.price;
      const guests = pkg.servesCount || pkg.guestCount || '';
      return {
        id: pkg.id,
        name: buildDisplayValue(name, 'Package name not set'),
        description: buildDisplayValue(description, 'Describe this package'),
        price: buildDisplayValue(formatUSD(priceValue), 'Pricing not yet added'),
        serves: buildDisplayValue(guests ? `Up to ${guests} guests` : '', 'Add guest count')
      };
    });

    const previewAddOns = (addOns || []).map((addOn) => ({
      id: addOn.id,
      name: buildDisplayValue(addOn.name, 'Add-on name not set'),
      price: buildDisplayValue(formatUSD(addOn.price), 'Pricing not yet added')
    }));

    const packageChips = isEventPro
      ? packageSource.slice(0, 3).map((pkg) => ({
          id: pkg.id,
          name: pkg.name || 'Package',
          price: pkg.basePrice ? formatUSD(pkg.basePrice) : 'Add price',
          serves: pkg.servesCount ? `Up to ${pkg.servesCount}` : ''
        }))
      : [];

    const logisticsSummary = isEventPro ? buildEventProLogisticsSummary(logistics, schedule) : '';
    const eventProDetails = isEventPro
      ? {
          badge: buildDisplayValue(profile.serviceType || 'Event Pro', 'Select a service type'),
          tagline: buildDisplayValue(profile.tagline, 'Share what makes activations unforgettable'),
          logistics: buildDisplayValue(logisticsSummary, 'Logistics details will appear here'),
          packageChips,
          offersOnsiteService: profile.offersOnsiteService,
          offersPickup: profile.offersPickup
        }
      : null;

    return {
      title: buildDisplayValue(basics.title, 'Untitled listing'),
      category: buildDisplayValue(
        basics.category || (isEventPro ? profile.serviceType || 'Event professional' : 'Rental equipment'),
        isEventPro ? 'Event professional' : 'Rental equipment'
      ),
      location: buildDisplayValue(previewLocationText, 'Location not set'),
      service: buildDisplayValue(serviceAreaText, 'Service area not set'),
      bookingMode: buildDisplayValue(bookingModeLabel, 'Rental mode not set'),
      price: buildDisplayValue(formattedPrice, 'Pricing not yet added'),
      heroImage,
      packages: previewPackages,
      addOns: previewAddOns,
      listingType,
      eventProDetails
    };
  }, [formData]);

  const setBasics = (field, value) => setFormData(prev => ({
    ...prev,
    basics: { ...prev.basics, [field]: value }
  }));

  const setSchedule = (field, value) => setFormData(prev => ({
    ...prev,
    schedule: { ...prev.schedule, [field]: value }
  }));

  const setPricing = (field, value) => setFormData(prev => ({
    ...prev,
    pricing: { ...prev.pricing, [field]: value }
  }));

  const setDocumentField = (field, value) => setFormData(prev => ({
    ...prev,
    documents: { ...prev.documents, [field]: value }
  }));

  const setAddOns = (updater) => setFormData(prev => ({
    ...prev,
    addOns: typeof updater === 'function' ? updater(prev.addOns) : updater
  }));

  const setPackages = (updater) => setFormData(prev => ({
    ...prev,
    pricing: {
      ...prev.pricing,
      packages: typeof updater === 'function' ? updater(prev.pricing.packages) : updater
    }
  }));

  const setEventProProfileField = (field, value) => setFormData((prev) => {
    const nextBasics = { ...prev.basics };
    if (field === 'city') {
      nextBasics.city = value;
    } else if (field === 'state') {
      nextBasics.state = value;
    } else if (field === 'serviceAreaDescription') {
      nextBasics.serviceLabel = value;
    }

    return {
      ...prev,
      basics: nextBasics,
      eventProProfile: { ...prev.eventProProfile, [field]: value }
    };
  });

  const setEventProLogisticsField = (field, value) => setFormData((prev) => {
    const nextBasics = field === 'serviceRadiusMiles'
      ? { ...prev.basics, serviceRadius: value }
      : prev.basics;

    return {
      ...prev,
      basics: nextBasics,
      eventProLogistics: { ...prev.eventProLogistics, [field]: value }
    };
  });

  const setEventProPackages = (updater) => setFormData((prev) => {
    const current = prev.eventProPackages || [];
    const next = typeof updater === 'function' ? updater(current) : updater;
    return {
      ...prev,
      eventProPackages: next && next.length ? next : [createEventProPackage()]
    };
  });

  const handleAddEventProPackage = () => {
    setEventProPackages((prev) => [...prev, createEventProPackage()]);
  };

  const handleRemoveEventProPackage = (packageId) => {
    setEventProPackages((prev) => prev.filter((pkg) => pkg.id !== packageId));
  };

  const handleEventProPackageChange = (packageId, field, value) => {
    setEventProPackages((prev) => prev.map((pkg) => (pkg.id === packageId ? { ...pkg, [field]: value } : pkg)));
  };

  const handleEventProPackageAddOnChange = (packageId, addOnId, field, value) => {
    setEventProPackages((prev) => prev.map((pkg) => {
      if (pkg.id !== packageId) return pkg;
      const nextAddOns = (pkg.addOns || []).map((addOn) => addOn.id === addOnId ? { ...addOn, [field]: value } : addOn);
      return { ...pkg, addOns: nextAddOns };
    }));
  };

  const handleAddEventProPackageAddOn = (packageId) => {
    setEventProPackages((prev) => prev.map((pkg) => (
      pkg.id === packageId
        ? { ...pkg, addOns: [...(pkg.addOns || []), createEventProPackageAddOn()] }
        : pkg
    )));
  };

  const handleRemoveEventProPackageAddOn = (packageId, addOnId) => {
    setEventProPackages((prev) => prev.map((pkg) => (
      pkg.id === packageId
        ? { ...pkg, addOns: (pkg.addOns || []).filter((addOn) => addOn.id !== addOnId) }
        : pkg
    )));
  };

  const handleGalleryUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setFormData(prev => ({
      ...prev,
      media: {
        ...prev.media,
        gallery: [
          ...prev.media.gallery,
          ...files.map(file => ({ id: createId(), name: file.name, preview: URL.createObjectURL(file) }))
        ]
      }
    }));
  };

  const handleCoverUpload = (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    setFormData(prev => ({
      ...prev,
      media: {
        ...prev.media,
        coverPreview: URL.createObjectURL(file)
      }
    }));
  };

  const removeGalleryImage = (id) => {
    setFormData(prev => ({
      ...prev,
      media: {
        ...prev.media,
        gallery: prev.media.gallery.filter(image => image.id !== id)
      }
    }));
  };

  const handleAddPackage = () => {
    setPackages(prev => [...prev, DEFAULT_PACKAGE()]);
  };

  const handlePackageChange = (id, field, value) => {
    setPackages(prev => prev.map(pkg => (pkg.id === id ? { ...pkg, [field]: value } : pkg)));
  };

  const handleRemovePackage = (id) => {
    setPackages(prev => prev.filter(pkg => pkg.id !== id));
  };

  const handleAddOnChange = (id, field, value) => {
    setAddOns(prev => prev.map(addOn => (addOn.id === id ? { ...addOn, [field]: value } : addOn)));
  };

  const handleAddAddOn = () => {
    setAddOns(prev => [...prev, DEFAULT_ADD_ON()]);
  };

  const handleRemoveAddOn = (id) => {
    setAddOns(prev => prev.filter(addOn => addOn.id !== id));
  };

  const goToStep = (nextStep) => {
    setCurrentStep(Math.min(Math.max(nextStep, 0), totalSteps - 1));
  };

  const handleBackNav = () => {
    if (currentStep === 0) return;
    goToStep(currentStep - 1);
  };

  const handleContinueNav = () => {
    if (currentStep === totalSteps - 1) return;
    if (isTypeStepActive && !formData.listingType) return;
    goToStep(currentStep + 1);
  };

  const buildListingPayload = () => {
    if (!formData.listingType) {
      throw new Error('Select a listing type before publishing.');
    }

    const title = formData.basics.title?.trim();
    if (!title) {
      throw new Error('Add a listing title before publishing.');
    }

    const city = formData.basics.city?.trim();
    if (!city) {
      throw new Error('City is required.');
    }

    const state = formData.basics.state?.trim();
    if (!state) {
      throw new Error('State is required.');
    }

    const primaryPrice = resolvePrimaryPrice(formData);
    if (!primaryPrice) {
      throw new Error('Add at least one price before publishing.');
    }

    const isEventPro = formData.listingType === 'eventPro' || formData.listingType === 'event_pro';
    const bookingMode = formData.schedule.bookingMode || (isEventPro ? 'per-event' : 'daily-with-time');
    const defaultStartTime = isEventPro
      ? formData.schedule.earliestStartTime
      : formData.schedule.defaultPickupTime;
    const defaultEndTime = isEventPro
      ? formData.schedule.latestEndTime
      : formData.schedule.defaultReturnTime;
    const serviceRadiusValue = isEventPro
      ? Number(formData.eventProLogistics.serviceRadiusMiles || formData.basics.serviceRadius)
      : Number(formData.basics.serviceRadius);
    const displayZoneLabel = isEventPro
      ? (formData.eventProProfile.serviceAreaDescription || formData.basics.serviceLabel || '').trim() || null
      : formData.basics.serviceLabel?.trim() || null;

    const payload = {
      title,
      description: formData.notes?.trim() || '',
      city,
      state,
      price: primaryPrice,
      listing_type: mapWizardListingType(formData.listingType),
      booking_mode: bookingMode,
      default_start_time: defaultStartTime || null,
      default_end_time: defaultEndTime || null,
      display_city: city,
      display_state: state,
      display_zone_label: displayZoneLabel,
      service_zone_type: 'radius',
      service_radius_miles: serviceRadiusValue || 15,
      // TODO: connect packages, add-ons, and media uploads once schema supports them.
    };

    if (isEventPro) {
      payload.event_pro_profile = {
        service_type: formData.eventProProfile.serviceType || null,
        business_name: formData.eventProProfile.businessName || null,
        display_name: formData.eventProProfile.displayName || null,
        tagline: formData.eventProProfile.tagline || null,
        service_area_description: formData.eventProProfile.serviceAreaDescription || null,
        offers_onsite_service: Boolean(formData.eventProProfile.offersOnsiteService),
        offers_pickup: Boolean(formData.eventProProfile.offersPickup)
      };

      payload.event_pro_packages = (formData.eventProPackages || []).map((pkg) => ({
        id: pkg.id,
        name: pkg.name || '',
        description: pkg.description || '',
        serves_count: pkg.servesCount || '',
        base_price: pkg.basePrice ? Number(pkg.basePrice) : null,
        price_unit: pkg.priceUnit || 'per_event',
        image_url: pkg.imageUrl || null,
        add_ons: (pkg.addOns || []).map((addOn) => ({
          id: addOn.id,
          name: addOn.name || '',
          description: addOn.description || '',
          price: addOn.price ? Number(addOn.price) : null,
          price_unit: addOn.priceUnit || 'per_event'
        }))
      }));

      payload.event_pro_logistics = {
        service_radius_miles: serviceRadiusValue || 15,
        travel_policy: formData.eventProLogistics.travelPolicy || 'included_within_radius',
        provides_staff_onsite: Boolean(formData.eventProLogistics.providesStaffOnsite),
        includes_setup_and_breakdown: Boolean(formData.eventProLogistics.includesSetupAndBreakdown),
        accepts_last_minute_bookings: Boolean(formData.eventProLogistics.acceptsLastMinuteBookings),
        typical_event_duration_hours: formData.schedule.eventDurationHours || null,
        earliest_start_time: formData.schedule.earliestStartTime || null,
        latest_end_time: formData.schedule.latestEndTime || null,
        available_days: Array.isArray(formData.schedule.availableDays) ? formData.schedule.availableDays : []
      };

      // TODO: Persist event_pro_profile, event_pro_packages, and event_pro_logistics once the listings schema supports JSONB metadata.
    }

    return payload;
  };

  const handlePublish = async (intent = 'published') => {
    if (intent !== 'published') {
      setInlineNotice('Draft saving is coming soon. Publish to share your listing.');
      return;
    }

    setInlineNotice('');
    setIsSubmitting(true);
    setSubmissionState((prev) => ({ ...prev, status: 'submitting', errorMessage: '', listing: null, shareUrl: '' }));

    const resolvedListingId = listingIdProp || initialData?.id || submissionState.listing?.id;
    const actionVerb = isEditMode ? 'update' : 'publish';

    try {
      const payload = buildListingPayload();
      let response;

      if (isEditMode) {
        if (!resolvedListingId) {
          throw new Error('Unable to update listing: missing listing ID.');
        }

        const updatePayload = { ...payload, id: resolvedListingId };
        response = await fetch('/api/listings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload)
        });
      } else {
        response = await fetch('/api/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const result = await response.json().catch(() => null);
      if (!response.ok || !result) {
        throw new Error(result?.error || `Failed to ${actionVerb} listing`);
      }

      if (result.success === false) {
        throw new Error(result.error || `Failed to ${actionVerb} listing`);
      }

      const listing = result.data || result.listing;
      if (!listing) {
        throw new Error('Listing response was empty.');
      }

      const shareUrl = buildShareUrl(listing);

      setSubmissionState({ status: 'success', errorMessage: '', listing, shareUrl });
      setViewMode('published');
      setCopyFeedback('');
    } catch (error) {
      console.error('Failed to save listing', error);
      setSubmissionState({ status: 'error', errorMessage: error.message || `Failed to ${actionVerb} listing`, listing: null, shareUrl: '' });
      setViewMode('editing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = async () => {
    const urlToCopy = submissionState.shareUrl || (submissionState.listing ? buildShareUrl(submissionState.listing) : '');
    if (!urlToCopy) return;
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopyFeedback('Link copied');
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setCopyFeedback(''), 2000);
    } catch (error) {
      console.error('Failed to copy link', error);
      setCopyFeedback('Unable to copy link');
    }
  };

  const downloadQr = () => {
    const urlForQr = submissionState.shareUrl || (submissionState.listing ? buildShareUrl(submissionState.listing) : '');
    if (!urlForQr || !qrCanvasRef.current) return;
    const canvas = qrCanvasRef.current.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'vendibook-listing-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const renderStepForm = () => {
    switch (activeStepKey) {
      case 'type':
        return (
          <div className="space-y-6">
            <header>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Step 1</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">What are you listing?</h2>
              <p className="text-slate-600 mt-2">Pick the experience that fits your business. You can add more later.</p>
            </header>
            <div className="grid md:grid-cols-2 gap-2">
              {[
                {
                  value: 'rental',
                  title: 'Rent a food truck or trailer',
                  description: 'Perfect for hardware like trucks, trailers, kitchens and vending lots.',
                  image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=600&auto=format&fit=crop&q=80'
                },
                {
                  value: 'eventPro',
                  title: 'Book an Event Pro',
                  description: 'Catering, dessert bars, bartending, coffee carts, candy setups and more.',
                  image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&auto=format&fit=crop&q=80'
                }
              ].map(option => (
                <button
                  type="button"
                  key={option.value}
                  className={`relative overflow-hidden rounded-2xl border text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF6A3D]/30 ${
                    formData.listingType === option.value
                      ? 'border-[#FF6A3D] bg-white shadow-lg ring-2 ring-[#FF6A3D] ring-offset-2'
                      : 'border-slate-200 bg-white hover:border-[#FF6A3D]/70 hover:shadow-lg'
                  }`}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      listingType: option.value,
                      pricing: {
                        ...prev.pricing,
                        packages: option.value === 'eventPro' && prev.pricing.packages.length === 0 ? [DEFAULT_PACKAGE()] : prev.pricing.packages
                      },
                      schedule: {
                        ...prev.schedule,
                        bookingMode: option.value === 'eventPro' ? 'per-event' : 'daily'
                      }
                    }));
                  }}
                >
                  <img src={option.image} alt={option.title} className="h-44 w-full object-cover" />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-slate-900">{option.title}</h3>
                      {formData.listingType === option.value ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
                          <Check className="h-3.5 w-3.5" /> Selected
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-slate-600">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 'eventProIntro':
        return (
          <EventProIntroStep onContinue={handleContinueNav} />
        );
      case 'eventProProfile':
        return (
          <EventProProfileStep
            profile={formData.eventProProfile}
            onChange={setEventProProfileField}
          />
        );
      case 'eventProPackages':
        return (
          <EventProPackagesStep
            packages={formData.eventProPackages}
            onAddPackage={handleAddEventProPackage}
            onRemovePackage={handleRemoveEventProPackage}
            onChangePackage={handleEventProPackageChange}
            onAddAddOn={handleAddEventProPackageAddOn}
            onRemoveAddOn={handleRemoveEventProPackageAddOn}
            onChangeAddOn={handleEventProPackageAddOnChange}
          />
        );
      case 'eventProLogistics':
        return (
          <EventProLogisticsStep
            logistics={formData.eventProLogistics}
            schedule={formData.schedule}
            onChange={setEventProLogisticsField}
            onScheduleChange={setSchedule}
          />
        );
      // TODO: Replace inline Step 2 form with a dedicated BasicsStep component powered by ListingWizardContext.
      case 'basics':
        return (
          <div className="space-y-6">
            <header>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Step 2</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Basics & service area</h2>
              <p className="text-slate-600 mt-2">These details help guests discover you.</p>
            </header>
            <div className="grid gap-5">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Listing title</span>
                <input
                  type="text"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  placeholder="Fully Equipped Taco Truck"
                  value={formData.basics.title}
                  onChange={(e) => setBasics('title', e.target.value)}
                />
              </label>
              <div className="grid md:grid-cols-2 gap-5">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Category</span>
                  <select
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    value={formData.basics.category}
                    onChange={(e) => setBasics('category', e.target.value)}
                  >
                    <option value="">Select category</option>
                    {(formData.listingType === 'eventPro' ? EVENT_PRO_CATEGORIES : RENTAL_CATEGORIES).map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Subcategory (optional)</span>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    placeholder="e.g., Wood-fired pizza"
                    value={formData.basics.subcategory}
                    onChange={(e) => setBasics('subcategory', e.target.value)}
                  />
                </label>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">City</span>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    placeholder="Phoenix"
                    value={formData.basics.city}
                    onChange={(e) => setBasics('city', e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">State / region</span>
                  <select
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    value={formData.basics.state}
                    onChange={(e) => setBasics('state', e.target.value)}
                  >
                    <option value="">State</option>
                    {STATE_OPTIONS.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Service radius (miles)</span>
                  <input
                    type="number"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    value={formData.basics.serviceRadius}
                    onChange={(e) => setBasics('serviceRadius', Number(e.target.value))}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Service area label</span>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    placeholder="Greater Phoenix metro"
                    value={formData.basics.serviceLabel}
                    onChange={(e) => setBasics('serviceLabel', e.target.value)}
                  />
                </label>
              </div>
            </div>
          </div>
        );
      // TODO: Step 3 (Schedule) will be split into its own component soon.
      case 'schedule':
        return (
          <div className="space-y-6">
            <header>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Step 3</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Schedule & booking mode</h2>
              <p className="text-slate-600 mt-2">Explain how guests can reserve your offer.</p>
            </header>
            {formData.listingType === 'eventPro' ? (
              <div className="space-y-5">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Booking mode</span>
                  <select
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                    value={formData.schedule.bookingMode}
                    onChange={(e) => setSchedule('bookingMode', e.target.value)}
                  >
                    <option value="per-event">Per event</option>
                    <option value="per-hour">Per hour</option>
                    <option value="package">Package based</option>
                  </select>
                </label>
                <div className="grid md:grid-cols-3 gap-5">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Typical event duration (hrs)</span>
                    <input
                      type="number"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                      value={formData.schedule.eventDurationHours}
                      onChange={(e) => setSchedule('eventDurationHours', Number(e.target.value))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Earliest start</span>
                    <input
                      type="time"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                      value={formData.schedule.earliestStartTime}
                      onChange={(e) => setSchedule('earliestStartTime', e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Latest wrap</span>
                    <input
                      type="time"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                      value={formData.schedule.latestEndTime}
                      onChange={(e) => setSchedule('latestEndTime', e.target.value)}
                    />
                  </label>
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-700">Available days</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSchedule(
                          'availableDays',
                          formData.schedule.availableDays.includes(day)
                            ? formData.schedule.availableDays.filter(d => d !== day)
                            : [...formData.schedule.availableDays, day]
                        )}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                          formData.schedule.availableDays.includes(day)
                            ? 'bg-orange-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-orange-300'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Booking mode</span>
                  <select
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                    value={formData.schedule.bookingMode}
                    onChange={(e) => setSchedule('bookingMode', e.target.value)}
                  >
                    <option value="daily">Per day</option>
                    <option value="multi-day">Multi day</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </label>
                <div className="grid md:grid-cols-2 gap-5">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Default pickup time</span>
                    <input
                      type="time"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                      value={formData.schedule.defaultPickupTime}
                      onChange={(e) => setSchedule('defaultPickupTime', e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Default return time</span>
                    <input
                      type="time"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                      value={formData.schedule.defaultReturnTime}
                      onChange={(e) => setSchedule('defaultReturnTime', e.target.value)}
                    />
                  </label>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Minimum rental days</span>
                    <input
                      type="number"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                      value={formData.schedule.minRentalDays}
                      onChange={(e) => setSchedule('minRentalDays', Number(e.target.value))}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Maximum rental days</span>
                    <input
                      type="number"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                      value={formData.schedule.maxRentalDays}
                      onChange={(e) => setSchedule('maxRentalDays', Number(e.target.value))}
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Availability summary</span>
                  <textarea
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                    rows={3}
                    placeholder="Weekdays only, delivery on Fridays..."
                    value={formData.schedule.availabilitySummary}
                    onChange={(e) => setSchedule('availabilitySummary', e.target.value)}
                  />
                </label>
              </div>
            )}
          </div>
        );
      // TODO: Step 4 (Pricing) will move into a PricingStep component.
      case 'pricing':
        return (
          <div className="space-y-6">
            <header>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Step 4</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Pricing & packages</h2>
              <p className="text-slate-600 mt-2">Share transparent pricing. Hosts can always adjust later.</p>
            </header>
            {isEventProListing ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 text-sm text-amber-800">
                Event Pro pricing now lives in the dedicated packages step. Add-ons below still apply to all listing types.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid md:grid-cols-3 gap-5">
                  {[
                    { label: 'Base daily rate', field: 'baseDailyRate', placeholder: '300' },
                    { label: 'Weekend rate', field: 'weekendRate', placeholder: '375' },
                    { label: 'Weekly rate', field: 'weeklyRate', placeholder: '1600' }
                  ].map(input => (
                    <label key={input.field} className="block text-sm font-semibold text-slate-700">
                      {input.label}
                      <input
                        type="number"
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                        placeholder={input.placeholder}
                        value={formData.pricing[input.field]}
                        onChange={(e) => setPricing(input.field, e.target.value)}
                      />
                    </label>
                  ))}
                </div>
                <div className="grid md:grid-cols-3 gap-5">
                  <label className="block text-sm font-semibold text-slate-700">
                    Cleaning / prep fee
                    <input
                      type="number"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                      value={formData.pricing.cleaningFee}
                      onChange={(e) => setPricing('cleaningFee', e.target.value)}
                    />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Delivery included up to (miles)
                    <input
                      type="number"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                      value={formData.pricing.deliveryIncludedMiles}
                      onChange={(e) => setPricing('deliveryIncludedMiles', e.target.value)}
                    />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Extra per mile fee
                    <input
                      type="number"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                      value={formData.pricing.deliveryPerMileFee}
                      onChange={(e) => setPricing('deliveryPerMileFee', e.target.value)}
                    />
                  </label>
                </div>
                <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                    checked={formData.pricing.deliveryAvailable}
                    onChange={(e) => setPricing('deliveryAvailable', e.target.checked)}
                  />
                  Delivery available
                </label>
              </div>
            )}
          </div>
        );
      // TODO: Step 5 (Media) will pull from an upcoming MediaStep component.
      case 'media':
        return (
          <div className="space-y-6">
            <header>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Step 5</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Photos & media</h2>
              <p className="text-slate-600 mt-2">Beautiful visuals help renters trust your experience.</p>
            </header>
            <div className="space-y-5">
              <section className="rounded-2xl border border-dashed border-orange-300 bg-orange-50/50 p-6">
                <div className="flex flex-col items-center text-center">
                  <Camera className="h-10 w-10 text-orange-500" />
                  <p className="mt-3 text-lg font-semibold text-slate-900">Cover image</p>
                  <p className="text-sm text-slate-600">This is the hero image for your listing card.</p>
                  <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-orange-600 px-5 py-2 text-sm font-semibold text-white shadow-lg">
                    <Upload className="h-4 w-4" /> Upload cover
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                  </label>
                  {formData.media.coverPreview && (
                    <img src={formData.media.coverPreview} alt="Cover" className="mt-4 h-48 w-full rounded-2xl object-cover" />
                  )}
                </div>
              </section>
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">Gallery</p>
                    <p className="text-sm text-slate-500">Add up to 8 supporting visuals.</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-300">
                    <ImageIcon className="h-4 w-4" /> Add images
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
                  </label>
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.media.gallery.map(image => (
                    <div key={image.id} className="relative">
                      <img src={image.preview} alt={image.name} className="h-32 w-full rounded-xl object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(image.id)}
                        className="absolute right-2 top-2 rounded-full bg-white/80 p-1 text-slate-600 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {formData.media.gallery.length === 0 && (
                    <div className="col-span-full rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                      Drop images here or use the Add images button.
                    </div>
                  )}
                </div>
              </section>
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-lg font-semibold text-slate-900">Video</p>
                <p className="text-sm text-slate-500">Link to a hosted walkthrough (YouTube, Loom, Vimeo).</p>
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Video className="h-5 w-5 text-slate-500" />
                  <input
                    type="url"
                    className="flex-1 bg-transparent text-sm text-slate-800 focus:outline-none"
                    placeholder="https://..."
                    value={formData.media.videoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, media: { ...prev.media, videoUrl: e.target.value } }))}
                  />
                </div>
              </section>
            </div>
          </div>
        );
      // TODO: Step 6 (Documents) will live in its own DocumentsStep component.
      case 'documents':
        return (
          <div className="space-y-6">
            <header>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Step 6</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Documents & compliance</h2>
              <p className="text-slate-600 mt-2">We keep these private until booking confirmation.</p>
            </header>
            <div className="space-y-4">
              {[
                { field: 'hasInsurance', label: 'I have insurance and will upload proof' },
                { field: 'hasPermits', label: 'I have required permits for my city' },
                { field: 'agreesToTerms', label: 'I agree to the Vendibook listing terms' }
              ].map(option => (
                <label key={option.field} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                    checked={formData.documents[option.field]}
                    onChange={(e) => setDocumentField(option.field, e.target.checked)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { field: 'insuranceName', label: 'Insurance document' },
                { field: 'permitName', label: 'Permit document' },
                { field: 'licenseName', label: 'License or certification' }
              ].map(doc => (
                <label key={doc.field} className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-600">
                  <FileText className="h-6 w-6 text-slate-400" />
                  {formData.documents[doc.field] ? (
                    <span className="font-semibold text-slate-900">{formData.documents[doc.field]}</span>
                  ) : (
                    <span>{doc.label}</span>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setDocumentField(doc.field, e.target.files?.[0]?.name || '')}
                  />
                  <span className="text-xs text-orange-600">Upload</span>
                </label>
              ))}
            </div>
          </div>
        );
      // TODO: Step 7 (Add-ons) will be extracted for reuse soon.
      case 'addOns':
        return (
          <div className="space-y-6">
            <header>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Step 7</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Add-ons & upsells</h2>
              <p className="text-slate-600 mt-2">Delight renters with curated extras.</p>
            </header>
            <div className="space-y-4">
              {formData.addOns.map(addOn => (
                <div key={addOn.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="grid md:grid-cols-2 gap-4">
                        <label className="block text-sm font-semibold text-slate-700">
                          Name
                          <input
                            type="text"
                            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                            value={addOn.name}
                            onChange={(e) => handleAddOnChange(addOn.id, 'name', e.target.value)}
                          />
                        </label>
                        <label className="block text-sm font-semibold text-slate-700">
                          Price
                          <input
                            type="number"
                            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                            value={addOn.price}
                            onChange={(e) => handleAddOnChange(addOn.id, 'price', e.target.value)}
                          />
                        </label>
                      </div>
                      <label className="block text-sm font-semibold text-slate-700">
                        Description
                        <textarea
                          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                          rows={2}
                          value={addOn.description}
                          onChange={(e) => handleAddOnChange(addOn.id, 'description', e.target.value)}
                        />
                      </label>
                      <label className="block text-sm font-semibold text-slate-700">
                        Price type
                        <select
                          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                          value={addOn.priceType}
                          onChange={(e) => handleAddOnChange(addOn.id, 'priceType', e.target.value)}
                        >
                          <option value="per-booking">Per booking</option>
                          <option value="per-hour">Per hour</option>
                          <option value="per-unit">Per unit</option>
                        </select>
                      </label>
                    </div>
                    {formData.addOns.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAddOn(addOn.id)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddAddOn}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:border-orange-300"
              >
                <Plus className="h-4 w-4" /> Add another add-on
              </button>
            </div>
          </div>
        );
      // TODO: Step 8 (Preview) will eventually be a standalone summary component.
      case 'preview':
        return (
          <div className="space-y-6">
            <header>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Step 8</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Preview & publish</h2>
              <p className="text-slate-600 mt-2">Give everything one more look before going live.</p>
            </header>
            {submissionState.status === 'error' && submissionState.errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {submissionState.errorMessage}
              </div>
            ) : null}
            {inlineNotice ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {inlineNotice}
              </div>
            ) : null}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <h3 className="text-2xl font-semibold text-slate-900">{derivedPreview.title.text}</h3>
              <p className={`text-sm ${derivedPreview.location.isPlaceholder ? 'text-slate-500' : 'text-slate-600'}`}>
                {derivedPreview.location.text} • {derivedPreview.category.text}
              </p>
              <p className={`mt-3 text-sm font-semibold ${derivedPreview.service.isPlaceholder ? 'text-slate-500' : 'text-slate-700'}`}>
                {derivedPreview.service.text}
              </p>
              <div className="mt-4 grid md:grid-cols-2 gap-6">
                <section>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Rental mode</p>
                  <p className={`mt-2 ${derivedPreview.bookingMode.isPlaceholder ? 'text-slate-500' : 'text-slate-800'}`}>
                    {derivedPreview.bookingMode.text}
                  </p>
                </section>
                <section>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Featured price</p>
                  <p className={`mt-2 text-3xl font-bold ${derivedPreview.price.isPlaceholder ? 'text-slate-500' : 'text-slate-900'}`}>
                    {derivedPreview.price.text}
                  </p>
                </section>
              </div>
              {derivedPreview.packages?.length ? (
                <section className="mt-6">
                  <h4 className="text-lg font-semibold text-slate-900">Packages</h4>
                  <div className="mt-3 space-y-3">
                    {derivedPreview.packages.map(pkg => (
                      <div key={pkg.id} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-semibold ${pkg.name.isPlaceholder ? 'text-slate-500' : 'text-slate-900'}`}>{pkg.name.text}</p>
                            <p className={`text-sm ${pkg.description.isPlaceholder ? 'text-slate-500' : 'text-slate-600'}`}>{pkg.description.text}</p>
                          </div>
                          <p className={`text-lg font-semibold ${pkg.price.isPlaceholder ? 'text-slate-500' : 'text-slate-900'}`}>{pkg.price.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
              {derivedPreview.addOns?.length ? (
                <section className="mt-6">
                  <h4 className="text-lg font-semibold text-slate-900">Add-ons</h4>
                  <ul className="mt-2 space-y-2 text-sm text-slate-600">
                    {derivedPreview.addOns.map(addOn => (
                      <li key={addOn.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                        <span className={addOn.name.isPlaceholder ? 'text-slate-500' : undefined}>{addOn.name.text}</span>
                        <span className={`font-semibold ${addOn.price.isPlaceholder ? 'text-slate-500' : 'text-slate-900'}`}>{addOn.price.text}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handlePublish('draft')}
                className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm font-semibold text-slate-700 transition hover:border-orange-300"
                disabled={isSubmitting}
              >
                Save as draft
              </button>
              <button
                type="button"
                onClick={() => handlePublish('published')}
                className="rounded-2xl bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEditMode ? 'Saving' : 'Publishing'}
                  </span>
                ) : (
                  isEditMode ? 'Save changes' : 'Publish listing'
                )}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const publishedListing = submissionState.listing;
  const shareLink = submissionState.shareUrl || (publishedListing ? buildShareUrl(publishedListing) : '');
  const successTitle = isEditMode ? 'Your changes are live on Vendibook.' : 'Your listing is live on Vendibook.';
  const successSubtitle = isEditMode
    ? 'We refreshed your public link and QR code with the latest details.'
    : 'Share your link anywhere or download a QR code for events.';
  const backButtonLabel = isEditMode ? 'Back to listings' : 'Back to dashboard';

  const successView = (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FF6A3D]">Success</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">{successTitle}</h2>
            <p className="mt-2 text-slate-600">{successSubtitle}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Listing</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{publishedListing?.title || formData.basics.title || 'Untitled listing'}</p>
            <p className="text-sm text-slate-600">{[publishedListing?.city || formData.basics.city, publishedListing?.state || formData.basics.state].filter(Boolean).join(', ') || 'Location not set'}</p>
            <span className="mt-3 inline-flex rounded-full bg-[#FF6A3D]/10 px-3 py-1 text-xs font-semibold text-[#FF6A3D]">
              {formatListingTypeLabel(publishedListing?.listing_type || mapWizardListingType(formData.listingType))}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <LinkIcon className="h-4 w-4 text-[#FF6A3D]" />
              <span className="truncate">{shareLink || 'Share link not available yet'}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(buildListingPath(publishedListing))}
                className="inline-flex items-center gap-2 rounded-full bg-[#FF6A3D] px-5 py-2 text-sm font-semibold text-white shadow-lg"
              >
                View listing
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:border-[#FF6A3D]"
              >
                <Copy className="h-4 w-4" /> Copy share link
              </button>
            </div>
            {copyFeedback ? <p className="text-xs text-emerald-600">{copyFeedback}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-[#FF6A3D]"
          >
            {backButtonLabel}
          </button>
        </section>
        <aside className="rounded-3xl border border-slate-100 bg-slate-50 p-6 text-center shadow-inner">
          <div ref={qrCanvasRef} className="mx-auto inline-flex items-center justify-center rounded-2xl bg-white p-4 shadow-sm">
            <QRCodeCanvas value={shareLink || 'https://vendibook.com'} size={200} includeMargin fgColor="#FF6A3D" />
          </div>
          <p className="mt-4 text-lg font-semibold text-slate-900">Vendibook QR ready</p>
          <p className="mt-2 text-sm text-slate-600">Print or share this code so people can quickly open your listing.</p>
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={downloadQr}
              className="w-full rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:border-[#FF6A3D]"
            >
              <span className="inline-flex items-center justify-center gap-2"><Download className="h-4 w-4" /> Download QR code</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(buildListingPath(publishedListing))}
              className="w-full rounded-full bg-[#FF6A3D]/10 px-5 py-2 text-sm font-semibold text-[#FF6A3D]"
            >
              Open listing page
            </button>
          </div>
        </aside>
      </div>
    </div>
  );

  const editingView = (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Progress</p>
            <h2 className="text-lg font-semibold text-slate-900">{activeStep?.label}</h2>
          </div>
          <p className="text-sm font-semibold text-slate-500">Step {currentStep + 1} of {totalSteps}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {stepConfig.map((step, index) => (
            <button
              key={step.key}
              type="button"
              onClick={() => goToStep(index)}
              className={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                index === currentStep
                  ? 'border-[#FF6A3D] bg-[#FF6A3D]/10 text-[#FF6A3D]'
                  : index < currentStep
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-500 hover:border-orange-200'
              }`}
            >
              {step.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 lg:p-8 shadow-lg">
          {renderStepForm()}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBackNav}
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:border-orange-300 disabled:opacity-60"
              disabled={currentStep === 0}
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleContinueNav}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
              disabled={isContinueDisabled}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <LivePreviewCard preview={derivedPreview} />
        </aside>
      </div>
    </div>
  );

  const wizardContent = viewMode === 'published' ? successView : editingView;

  return (
    <ListingWizardContext.Provider value={contextValue}>
      {wizardContent}
    </ListingWizardContext.Provider>
  );
}

function EventProIntroStep({ onContinue }) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Step 2</p>
        <h2 className="text-3xl font-bold text-slate-900 mt-2">How Event Pro listings work</h2>
        <p className="text-slate-600 mt-2">You will capture your profile, curated packages, and logistics so hosts understand exactly what you bring to every activation.</p>
      </header>
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-sm text-slate-600">
        Use this flow if you sell turnkey experiences (catering, dessert bars, bartending, coffee carts, immersive installations, and similar service-based offerings).
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[{
          title: 'Profile & positioning',
          body: 'Share your service type, headline, and primary service area so planners can quickly assess fit.'
        }, {
          title: 'Packages & add-ons',
          body: 'Highlight signature offerings, ideal guest counts, pricing units, and optional upgrades.'
        }, {
          title: 'Logistics & coverage',
          body: 'Clarify travel radius, staffing, setup support, and how flexible you are with timing.'
        }].map((card) => (
          <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{card.title}</p>
            <p className="mt-2 text-sm text-slate-600">{card.body}</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onContinue?.()}
        className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl"
      >
        Jump into profile
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function EventProProfileStep({ profile, onChange }) {
  const safeProfile = profile || INITIAL_EVENT_PRO_PROFILE;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Step 3</p>
        <h2 className="text-3xl font-bold text-slate-900 mt-2">Your Event Pro profile</h2>
        <p className="text-slate-600 mt-2">Introduce your business the way you want hosts to remember it.</p>
      </header>
      <div className="grid md:grid-cols-2 gap-5">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Service type</span>
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
            value={safeProfile.serviceType}
            onChange={(e) => onChange('serviceType', e.target.value)}
          >
            <option value="">Select a service</option>
            {EVENT_PRO_SERVICE_TYPES.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Business name (internal)</span>
          <input
            type="text"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Fiesta & Co Catering"
            value={safeProfile.businessName}
            onChange={(e) => onChange('businessName', e.target.value)}
          />
        </label>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Public display name</span>
          <input
            type="text"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Fiesta & Co Taco Cart"
            value={safeProfile.displayName}
            onChange={(e) => onChange('displayName', e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Tagline</span>
          <input
            type="text"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Fresh, chef-led tacos for 50-250 guests"
            value={safeProfile.tagline}
            onChange={(e) => onChange('tagline', e.target.value)}
          />
        </label>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">City</span>
          <input
            type="text"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Phoenix"
            value={safeProfile.city}
            onChange={(e) => onChange('city', e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">State / region</span>
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
            value={safeProfile.state}
            onChange={(e) => onChange('state', e.target.value)}
          >
            <option value="">State</option>
            {STATE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="space-y-3">
        <span className="text-sm font-semibold text-slate-700">How do you service events?</span>
        <div className="flex flex-wrap gap-3">
          {[{
            field: 'offersOnsiteService',
            label: 'We bring the full onsite experience'
          }, {
            field: 'offersPickup',
            label: 'Clients can pick up from us'
          }].map((toggle) => (
            <label
              key={toggle.field}
              className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                checked={Boolean(safeProfile[toggle.field])}
                onChange={(e) => onChange(toggle.field, e.target.checked)}
              />
              {toggle.label}
            </label>
          ))}
        </div>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Service area story</span>
        <textarea
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
          rows={4}
          placeholder="Greater Phoenix events, Scottsdale resorts, and custom builds within 30 miles."
          value={safeProfile.serviceAreaDescription}
          onChange={(e) => onChange('serviceAreaDescription', e.target.value)}
        />
        <p className="mt-2 text-xs text-slate-500">This appears on your card and should describe where you shine geographically.</p>
      </label>
    </div>
  );
}

function EventProPackagesStep({
  packages,
  onAddPackage,
  onRemovePackage,
  onChangePackage,
  onAddAddOn,
  onRemoveAddOn,
  onChangeAddOn
}) {
  const safePackages = Array.isArray(packages) && packages.length ? packages : [createEventProPackage()];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Step 4</p>
        <h2 className="text-3xl font-bold text-slate-900 mt-2">Signature packages</h2>
        <p className="text-slate-600 mt-2">Name your marquee experiences, share guest counts, and anchor pricing. Add-ons help upsell customizations.</p>
      </header>
      {safePackages.map((pkg, index) => (
        <section key={pkg.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Package {index + 1}</p>
              <p className="text-lg font-semibold text-slate-900">{pkg.name || 'Untitled package'}</p>
            </div>
            {safePackages.length > 1 && (
              <button
                type="button"
                onClick={() => onRemovePackage(pkg.id)}
                className="text-slate-400 hover:text-rose-500"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Package name
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="Sunset Fiesta Service"
                value={pkg.name}
                onChange={(e) => onChangePackage(pkg.id, 'name', e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Ideal guest count
              <input
                type="number"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="100"
                value={pkg.servesCount}
                onChange={(e) => onChangePackage(pkg.id, 'servesCount', e.target.value)}
              />
            </label>
          </div>
          <label className="mt-4 block text-sm font-semibold text-slate-700">
            Package description
            <textarea
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              rows={3}
              placeholder="Includes two staffed stations, compostable service ware, and seasonal menu."
              value={pkg.description}
              onChange={(e) => onChangePackage(pkg.id, 'description', e.target.value)}
            />
          </label>
          <div className="mt-4 grid md:grid-cols-3 gap-4">
            <label className="block text-sm font-semibold text-slate-700">
              Base price
              <input
                type="number"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="2500"
                value={pkg.basePrice}
                onChange={(e) => onChangePackage(pkg.id, 'basePrice', e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Price unit
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                value={pkg.priceUnit}
                onChange={(e) => onChangePackage(pkg.id, 'priceUnit', e.target.value)}
              >
                {EVENT_PRO_PRICE_UNITS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Cover image URL
              {/* TODO: Persist Event Pro package media uploads once storage is wired. */}
              <input
                type="url"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="https://"
                value={pkg.imageUrl}
                onChange={(e) => onChangePackage(pkg.id, 'imageUrl', e.target.value)}
              />
            </label>
          </div>
          <div className="mt-5 space-y-3">
            <p className="text-sm font-semibold text-slate-700">Package add-ons</p>
            {(pkg.addOns || []).map((addOn) => (
              <div key={addOn.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <label className="block text-xs font-semibold text-slate-600">
                        Name
                        <input
                          type="text"
                          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                          value={addOn.name}
                          onChange={(e) => onChangeAddOn(pkg.id, addOn.id, 'name', e.target.value)}
                        />
                      </label>
                      <label className="block text-xs font-semibold text-slate-600">
                        Price
                        <input
                          type="number"
                          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                          value={addOn.price}
                          onChange={(e) => onChangeAddOn(pkg.id, addOn.id, 'price', e.target.value)}
                        />
                      </label>
                    </div>
                    <label className="block text-xs font-semibold text-slate-600">
                      Description
                      <textarea
                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                        rows={2}
                        value={addOn.description}
                        onChange={(e) => onChangeAddOn(pkg.id, addOn.id, 'description', e.target.value)}
                      />
                    </label>
                    <label className="block text-xs font-semibold text-slate-600">
                      Price unit
                      <select
                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                        value={addOn.priceUnit}
                        onChange={(e) => onChangeAddOn(pkg.id, addOn.id, 'priceUnit', e.target.value)}
                      >
                        {EVENT_PRO_PRICE_UNITS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveAddOn(pkg.id, addOn.id)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onAddAddOn(pkg.id)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-orange-300"
            >
              <Plus className="h-4 w-4" /> Add add-on
            </button>
          </div>
        </section>
      ))}
      <button
        type="button"
        onClick={onAddPackage}
        className="inline-flex items-center gap-2 rounded-full border border-dashed border-orange-300 px-5 py-2 text-sm font-semibold text-orange-600"
      >
        <Plus className="h-4 w-4" /> Add another package
      </button>
    </div>
  );
}

function EventProLogisticsStep({ logistics, schedule, onChange, onScheduleChange }) {
  const safeSchedule = schedule || INITIAL_FORM_DATA.schedule;
  const selectedDays = safeSchedule.availableDays || [];

  const toggleDay = (day) => {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((value) => value !== day)
      : [...selectedDays, day];
    onScheduleChange('availableDays', next);
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Step 5</p>
        <h2 className="text-3xl font-bold text-slate-900 mt-2">Logistics & coverage</h2>
        <p className="text-slate-600 mt-2">Set clear expectations around where you travel, when you operate, and how flexible you are.</p>
      </header>
      <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-600">
        Travel radius and staffing info appears on your listing preview so planners can route the right opportunities your way.
      </section>
      <div className="grid md:grid-cols-2 gap-5">
        <label className="block text-sm font-semibold text-slate-700">
          Service radius (miles)
          <input
            type="number"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
            value={logistics.serviceRadiusMiles}
            onChange={(e) => onChange('serviceRadiusMiles', e.target.value === '' ? '' : Number(e.target.value))}
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Travel policy
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
            value={logistics.travelPolicy}
            onChange={(e) => onChange('travelPolicy', e.target.value)}
          >
            {EVENT_PRO_TRAVEL_POLICIES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        <label className="block text-sm font-semibold text-slate-700">
          Typical event duration (hrs)
          <input
            type="number"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
            value={safeSchedule.eventDurationHours}
            onChange={(e) => onScheduleChange('eventDurationHours', Number(e.target.value))}
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Earliest arrival
          <input
            type="time"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
            value={safeSchedule.earliestStartTime}
            onChange={(e) => onScheduleChange('earliestStartTime', e.target.value)}
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Latest breakdown
          <input
            type="time"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
            value={safeSchedule.latestEndTime}
            onChange={(e) => onScheduleChange('latestEndTime', e.target.value)}
          />
        </label>
      </div>
      <div>
        <span className="text-sm font-semibold text-slate-700">Available days</span>
        <div className="mt-3 flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <button
              type="button"
              key={day}
              onClick={() => toggleDay(day)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                selectedDays.includes(day)
                  ? 'bg-orange-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-orange-300'
              }`}
            >
              {day.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {[{
          field: 'providesStaffOnsite',
          label: 'We staff onsite and manage service'
        }, {
          field: 'includesSetupAndBreakdown',
          label: 'Setup + breakdown included'
        }, {
          field: 'acceptsLastMinuteBookings',
          label: 'Open to inquiries inside 7 days'
        }].map((option) => (
          <label
            key={option.field}
            className="inline-flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              checked={Boolean(logistics[option.field])}
              onChange={(e) => onChange(option.field, e.target.checked)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function LivePreviewCard({ preview }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-slate-900 text-white p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-orange-200">Live preview</p>
        <h3 className="mt-3 text-2xl font-bold">{preview.title.text}</h3>
        <p className={`text-sm ${preview.location.isPlaceholder ? 'text-slate-500' : 'text-slate-200'}`}>
          {preview.location.text} • {preview.category.text}
        </p>
        <p className={`mt-3 text-sm ${preview.service.isPlaceholder ? 'text-slate-500' : 'text-orange-100'}`}>
          {preview.service.text}
        </p>
        {preview.eventProDetails ? (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-100">Event Pro</span>
              <span className={`rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ${preview.eventProDetails.badge?.isPlaceholder ? 'text-slate-400' : 'text-orange-100'}`}>
                {preview.eventProDetails.badge?.text}
              </span>
            </div>
            <p className={`text-sm ${preview.eventProDetails.tagline?.isPlaceholder ? 'text-slate-400' : 'text-orange-50'}`}>
              {preview.eventProDetails.tagline?.text}
            </p>
            <p className={`text-xs ${preview.eventProDetails.logistics?.isPlaceholder ? 'text-slate-500' : 'text-orange-100/80'}`}>
              {preview.eventProDetails.logistics?.text}
            </p>
          </div>
        ) : null}
        <p className={`mt-4 text-3xl font-semibold ${preview.price.isPlaceholder ? 'text-slate-500' : ''}`}>
          {preview.price.text}
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <img src={preview.heroImage} alt="Preview" className="h-48 w-full object-cover" />
        <div className="p-4 space-y-3">
          <p className={`text-sm font-semibold ${preview.bookingMode.isPlaceholder ? 'text-slate-500' : 'text-slate-700'}`}>
            {preview.bookingMode.text}
          </p>
          {preview.packages?.length ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Packages snapshot</p>
              <p className="text-sm text-slate-700">
                {preview.packages[0].name.text} starting at <span className={preview.packages[0].price.isPlaceholder ? 'text-slate-500' : undefined}>{preview.packages[0].price.text}</span>
              </p>
              {preview.eventProDetails?.packageChips?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {preview.eventProDetails.packageChips.map((chip) => (
                    <span key={chip.id} className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                      {chip.name} {chip.price ? `• ${chip.price}` : ''} {chip.serves ? `• ${chip.serves}` : ''}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          {preview.addOns?.length ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Add-ons</p>
              <ul className="text-sm text-slate-600">
                {preview.addOns.slice(0, 2).map(addOn => (
                  <li key={addOn.id} className={addOn.name.isPlaceholder ? 'text-slate-500' : undefined}>• {addOn.name.text}</li>
                ))}
                {preview.addOns.length > 2 && <li className="text-xs text-slate-400">+{preview.addOns.length - 2} more</li>}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

ListingCreationWizard.propTypes = {
  onClose: PropTypes.func,
  mode: PropTypes.oneOf(['create', 'edit']),
  initialData: PropTypes.object,
  listingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

EventProIntroStep.propTypes = {
  onContinue: PropTypes.func
};

EventProProfileStep.propTypes = {
  profile: PropTypes.object,
  onChange: PropTypes.func.isRequired
};

EventProPackagesStep.propTypes = {
  packages: PropTypes.arrayOf(PropTypes.object).isRequired,
  onAddPackage: PropTypes.func.isRequired,
  onRemovePackage: PropTypes.func.isRequired,
  onChangePackage: PropTypes.func.isRequired,
  onAddAddOn: PropTypes.func.isRequired,
  onRemoveAddOn: PropTypes.func.isRequired,
  onChangeAddOn: PropTypes.func.isRequired
};

EventProLogisticsStep.propTypes = {
  logistics: PropTypes.object.isRequired,
  schedule: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onScheduleChange: PropTypes.func.isRequired
};

LivePreviewCard.propTypes = {
  preview: PropTypes.object.isRequired
};

ListingCreationWizard.defaultProps = {
  onClose: () => {},
  mode: 'create',
  initialData: null,
  listingId: null
};

export default ListingCreationWizard;
