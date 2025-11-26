import { useMemo, useRef, useState } from 'react';
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

const createId = () => (
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10)
);

const STEP_CONFIG = [
  { key: 'type', label: 'Listing type', description: 'Tell us what you offer' },
  { key: 'basics', label: 'Basics', description: 'Location & positioning' },
  { key: 'schedule', label: 'Schedule', description: 'Booking availability' },
  { key: 'pricing', label: 'Pricing & packages', description: 'Rates and offerings' },
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
  notes: ''
};

function ListingCreationWizard({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState({ status: 'idle', shareUrl: '', listingId: '' });
  const qrCanvasRef = useRef(null);

  const totalSteps = STEP_CONFIG.length;

  const derivedPreview = useMemo(() => {
    const { basics, schedule, pricing, media, addOns, listingType } = formData;
    const cityState = [basics.city, basics.state].filter(Boolean).join(', ');
    const serviceText = basics.serviceRadius
      ? `Serves locations within ${basics.serviceRadius} miles${basics.serviceLabel ? ` of ${basics.serviceLabel}` : cityState ? ` of ${cityState}` : ''}`
      : basics.serviceLabel;

    const heroImage = media.coverPreview ||
      (listingType === 'eventPro'
        ? 'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=900&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1505471768190-0af6755fab1c?w=900&auto=format&fit=crop&q=80');

    return {
      title: basics.title || 'Untitled listing',
      category: basics.category || (listingType === 'eventPro' ? 'Event professional' : 'Rental equipment'),
      location: cityState || 'Location TBD',
      serviceText,
      bookingSummary:
        listingType === 'eventPro'
          ? `Event window: ${schedule.eventDurationHours || 4} hrs • ${schedule.earliestStartTime} - ${schedule.latestEndTime}`
          : `Rental mode: ${schedule.bookingMode || 'daily'} • ${schedule.minRentalDays}-${schedule.maxRentalDays} day(s)` ,
      basePrice:
        listingType === 'eventPro'
          ? (pricing.packages[0]?.price || pricing.hourlyRate || '—')
          : pricing.baseDailyRate || '—',
      heroImage,
      packages: pricing.packages,
      addOns,
      listingType
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

  const handleSubmit = async (status = 'published') => {
    setIsSubmitting(true);
    setSubmissionState({ status: 'submitting', shareUrl: '', listingId: '' });

    try {
      const payload = {
        ...formData,
        status
      };

      // TODO: Replace with real POST /api/listings endpoint when backend is ready.
      const fakeListingId = createId();
      const url = `${window.location.origin}/listing/${fakeListingId}`;

      console.info('Stubbed listing payload', payload);

      setSubmissionState({ status: 'success', shareUrl: url, listingId: fakeListingId });
    } catch (error) {
      console.error('Failed to submit listing', error);
      setSubmissionState({ status: 'error', shareUrl: '', listingId: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(submissionState.shareUrl);
    } catch (error) {
      console.error('Failed to copy link', error);
    }
  };

  const downloadQr = () => {
    if (!qrCanvasRef.current) return;
    const canvas = qrCanvasRef.current.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'vendibook-listing-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const renderStepForm = () => {
    switch (STEP_CONFIG[currentStep].key) {
      case 'type':
        return (
          <div className="space-y-6">
            <header>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Step 1</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">What are you listing?</h2>
              <p className="text-slate-600 mt-2">Pick the experience that fits your business. You can add more later.</p>
            </header>
            <div className="grid md:grid-cols-2 gap-4">
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
                  className={`relative overflow-hidden rounded-2xl border text-left shadow-sm transition focus:outline-none focus:ring-4 focus:ring-orange-200 ${
                    formData.listingType === option.value
                      ? 'border-orange-500 bg-white shadow-lg'
                      : 'border-slate-200 bg-white hover:border-orange-300'
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
      case 'pricing':
        return (
          <div className="space-y-6">
            <header>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Step 4</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Pricing & packages</h2>
              <p className="text-slate-600 mt-2">Share transparent pricing. Hosts can always adjust later.</p>
            </header>
            {formData.listingType === 'eventPro' ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Event packages</h3>
                  <button
                    type="button"
                    onClick={handleAddPackage}
                    className="inline-flex items-center gap-2 rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50"
                  >
                    <Plus className="h-4 w-4" /> Add package
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.pricing.packages.map(pkg => (
                    <div key={pkg.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="grid md:grid-cols-2 gap-4">
                            <label className="block text-sm font-semibold text-slate-700">
                              Package name
                              <input
                                type="text"
                                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                                value={pkg.name}
                                onChange={(e) => handlePackageChange(pkg.id, 'name', e.target.value)}
                              />
                            </label>
                            <label className="block text-sm font-semibold text-slate-700">
                              Included guests
                              <input
                                type="number"
                                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                                value={pkg.guestCount}
                                onChange={(e) => handlePackageChange(pkg.id, 'guestCount', e.target.value)}
                              />
                            </label>
                          </div>
                          <label className="block text-sm font-semibold text-slate-700">
                            Short description
                            <textarea
                              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                              rows={2}
                              value={pkg.description}
                              onChange={(e) => handlePackageChange(pkg.id, 'description', e.target.value)}
                            />
                          </label>
                          <label className="block text-sm font-semibold text-slate-700">
                            What’s included (line break to create bullets)
                            <textarea
                              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                              rows={3}
                              value={pkg.inclusions}
                              onChange={(e) => handlePackageChange(pkg.id, 'inclusions', e.target.value)}
                            />
                          </label>
                          <label className="block text-sm font-semibold text-slate-700">
                            Price
                            <input
                              type="number"
                              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                              value={pkg.price}
                              onChange={(e) => handlePackageChange(pkg.id, 'price', e.target.value)}
                            />
                          </label>
                        </div>
                        {formData.pricing.packages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePackage(pkg.id)}
                            className="text-slate-400 hover:text-rose-500"
                            aria-label="Remove package"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid md:grid-cols-2 gap-5 pt-4 border-t border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700">
                    Hourly rate (optional)
                    <input
                      type="number"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                      value={formData.pricing.hourlyRate}
                      onChange={(e) => setPricing('hourlyRate', e.target.value)}
                    />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Minimum hours
                    <input
                      type="number"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                      value={formData.pricing.hourlyMinimumHours}
                      onChange={(e) => setPricing('hourlyMinimumHours', e.target.value)}
                    />
                  </label>
                </div>
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
      case 'preview':
        return (
          <div className="space-y-6">
            <header>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Step 8</p>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Preview & publish</h2>
              <p className="text-slate-600 mt-2">Give everything one more look before going live.</p>
            </header>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <h3 className="text-2xl font-semibold text-slate-900">{derivedPreview.title}</h3>
              <p className="text-sm text-slate-600">{derivedPreview.location} • {derivedPreview.category}</p>
              <p className="mt-3 text-sm font-semibold text-slate-700">{derivedPreview.serviceText}</p>
              <div className="mt-4 grid md:grid-cols-2 gap-6">
                <section>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Booking summary</p>
                  <p className="mt-2 text-slate-800">{derivedPreview.bookingSummary}</p>
                </section>
                <section>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Featured price</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {derivedPreview.basePrice ? `$${Number(derivedPreview.basePrice).toLocaleString()}` : '—'}
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
                            <p className="font-semibold text-slate-900">{pkg.name || 'Untitled package'}</p>
                            <p className="text-sm text-slate-600">{pkg.description || 'Add a short description'}</p>
                          </div>
                          <p className="text-lg font-semibold text-slate-900">{pkg.price ? `$${pkg.price}` : 'TBD'}</p>
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
                        <span>{addOn.name || 'Untitled add-on'}</span>
                        <span className="font-semibold text-slate-900">{addOn.price ? `$${addOn.price}` : 'TBD'}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm font-semibold text-slate-700 transition hover:border-orange-300"
                disabled={isSubmitting}
              >
                Save as draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('published')}
                className="rounded-2xl bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Publishing</span> : 'Publish listing'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (submissionState.status === 'success') {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <Check className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-slate-900">Listing published!</h2>
          <p className="mt-2 text-slate-600">Share your new listing anywhere. We generated a link and QR code for you.</p>
          <div className="mt-6 w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Public link</p>
            <p className="mt-2 flex items-center gap-2 truncate text-sm text-slate-700">
              <LinkIcon className="h-4 w-4 text-orange-500" />
              {submissionState.shareUrl}
            </p>
            <button
              type="button"
              onClick={copyLink}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 hover:border-orange-300"
            >
              <Copy className="h-4 w-4" /> Copy link
            </button>
          </div>
          <div ref={qrCanvasRef} className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <QRCodeCanvas value={submissionState.shareUrl} size={180} includeMargin fgColor="#ea580c" />
            <p className="mt-3 text-sm font-semibold text-slate-800">Vendibook QR ready</p>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={downloadQr}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-300"
              >
                <Download className="h-4 w-4" /> Download PNG
              </button>
              <button
                type="button"
                onClick={() => window.open(submissionState.shareUrl, '_blank')}
                className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg"
              >
                View listing
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-8 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-orange-300"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Progress</p>
            <h2 className="text-lg font-semibold text-slate-900">{STEP_CONFIG[currentStep].label}</h2>
          </div>
          <p className="text-sm font-semibold text-slate-500">Step {currentStep + 1} of {totalSteps}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {STEP_CONFIG.map((step, index) => (
            <button
              key={step.key}
              type="button"
              onClick={() => goToStep(index)}
              className={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                index === currentStep
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
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
              onClick={() => goToStep(currentStep - 1)}
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:border-orange-300"
              disabled={currentStep === 0}
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => goToStep(currentStep + 1)}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
              disabled={currentStep === totalSteps - 1}
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
}

function LivePreviewCard({ preview }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-slate-900 text-white p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-orange-200">Live preview</p>
        <h3 className="mt-3 text-2xl font-bold">{preview.title}</h3>
        <p className="text-sm text-slate-200">{preview.location} • {preview.category}</p>
        <p className="mt-3 text-sm text-orange-100">{preview.serviceText}</p>
        <p className="mt-4 text-3xl font-semibold">{preview.basePrice ? `$${Number(preview.basePrice).toLocaleString()}` : 'Set price'}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <img src={preview.heroImage} alt="Preview" className="h-48 w-full object-cover" />
        <div className="p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-700">{preview.bookingSummary}</p>
          {preview.packages?.length ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Packages snapshot</p>
              <p className="text-sm text-slate-700">{preview.packages[0].name || 'Add package name'} starting at {preview.packages[0].price ? `$${preview.packages[0].price}` : 'TBD'}</p>
            </div>
          ) : null}
          {preview.addOns?.length ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Add-ons</p>
              <ul className="text-sm text-slate-600">
                {preview.addOns.slice(0, 2).map(addOn => (
                  <li key={addOn.id}>• {addOn.name || 'Untitled add-on'}</li>
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
  onClose: PropTypes.func
};

LivePreviewCard.propTypes = {
  preview: PropTypes.object.isRequired
};

ListingCreationWizard.defaultProps = {
  onClose: () => {}
};

export default ListingCreationWizard;
