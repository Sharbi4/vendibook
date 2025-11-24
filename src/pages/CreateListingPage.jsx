import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PageShell from '../components/layout/PageShell.jsx';
import VerificationRequired from '../components/VerificationRequired.jsx';

const LISTING_TYPE_OPTIONS = [
  { value: 'food_truck', label: 'Food truck' },
  { value: 'food_trailer', label: 'Food trailer' },
  { value: 'ghost_kitchen', label: 'Ghost kitchen' },
  { value: 'event_pro', label: 'Event professional' },
  { value: 'lot', label: 'Vending lot / commissary' },
];

const BOOKING_MODE_OPTIONS = [
  { value: 'daily', label: 'Daily rental (full days)' },
  { value: 'daily-with-time', label: 'Daily rental with pickup/drop-off times' },
  { value: 'hourly', label: 'Hourly or event-based' },
  { value: 'package', label: 'Package / flat fee' },
];

const INITIAL_FORM = {
  title: '',
  listingType: '',
  city: '',
  state: '',
  price: '',
  description: '',
  bookingMode: 'daily-with-time',
  serviceRadiusMiles: '15',
  serviceZoneLabel: '',
};

function CreateListingPage() {
  const navigate = useNavigate();
  const { authorizedFetch, needsVerification } = useAuth();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'state' ? value.toUpperCase().slice(0, 2) : value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      nextErrors.title = 'Enter a descriptive title (3+ characters).';
    }
    if (!formData.listingType) {
      nextErrors.listingType = 'Select a listing type.';
    }
    if (!formData.city.trim()) {
      nextErrors.city = 'City is required.';
    }
    if (!formData.state.trim() || formData.state.trim().length !== 2) {
      nextErrors.state = 'State must be two letters.';
    }
    const priceNumber = Number(formData.price);
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      nextErrors.price = 'Enter a price above zero.';
    }
    if (!formData.bookingMode) {
      nextErrors.bookingMode = 'Select a booking mode.';
    }
    const radiusNumber = Number(formData.serviceRadiusMiles);
    if (!Number.isFinite(radiusNumber) || radiusNumber <= 0) {
      nextErrors.serviceRadiusMiles = 'Service radius must be greater than zero.';
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setFormError('Please fix the highlighted fields and try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        listingType: formData.listingType,
        city: formData.city.trim(),
        state: formData.state.trim(),
        price: Number(formData.price),
        description: formData.description.trim() || undefined,
        bookingMode: formData.bookingMode,
        serviceRadiusMiles: Number(formData.serviceRadiusMiles),
        serviceZoneLabel: formData.serviceZoneLabel.trim() || undefined,
      };

      const response = await authorizedFetch('/api/listings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const createdListing = response?.data || response?.listing || response;
      if (!createdListing?.id) {
        throw new Error('Listing created but missing ID.');
      }
      navigate(`/listing/${createdListing.id}`);
    } catch (error) {
      const message = error?.message || 'Failed to create listing.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (needsVerification) {
    return (
      <PageShell
        title="Create a New Listing"
        subtitle="Email verification required"
        maxWidth="max-w-4xl"
        action={{ label: 'Back to dashboard', onClick: () => navigate('/host/dashboard') }}
      >
        <VerificationRequired
          title="Verify your email before creating listings"
          description="We sent you a verification link. Once confirmed, you can publish listings and start booking renters."
        />
      </PageShell>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/60 to-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            type="button"
            className="text-sm font-medium text-orange-600 hover:text-orange-700"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-orange-100/60 p-6 sm:p-10">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">Create listing</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Share your equipment or services</h1>
            <p className="mt-3 text-slate-600">
              Listings created here feed directly into the marketplace and the listing detail page. Keep the
              information accurate so renters know what to expect.
            </p>
          </div>

          {formError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Listing title
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleChange('title')}
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.title ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="Fully equipped taco truck"
                  autoComplete="off"
                />
              </label>
              {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Listing type
                <select
                  value={formData.listingType}
                  onChange={handleChange('listingType')}
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.listingType ? 'border-red-400' : 'border-slate-200'}`}
                >
                  <option value="">Select a type</option>
                  {LISTING_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              {errors.listingType && <p className="text-sm text-red-600">{errors.listingType}</p>}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                City
                <input
                  type="text"
                  value={formData.city}
                  onChange={handleChange('city')}
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.city ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="Phoenix"
                  autoComplete="address-level2"
                />
              </label>
              {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                State
                <input
                  type="text"
                  value={formData.state}
                  onChange={handleChange('state')}
                  className={`mt-2 w-32 rounded-2xl border px-4 py-3 text-base uppercase tracking-wide shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.state ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="AZ"
                  maxLength={2}
                  autoComplete="address-level1"
                />
              </label>
              {errors.state && <p className="text-sm text-red-600">{errors.state}</p>}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Price (USD)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange('price')}
                    className={`mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.price ? 'border-red-400' : 'border-slate-200'}`}
                    placeholder="250"
                  />
                </label>
                {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
                <p className="text-xs text-slate-500">Displayed on the listing detail page.</p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Booking mode
                  <select
                    value={formData.bookingMode}
                    onChange={handleChange('bookingMode')}
                    className={`mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.bookingMode ? 'border-red-400' : 'border-slate-200'}`}
                  >
                    {BOOKING_MODE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                {errors.bookingMode && <p className="text-sm text-red-600">{errors.bookingMode}</p>}
                <p className="text-xs text-slate-500">Matches the booking call-to-action on the detail page.</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Service radius (miles)
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.serviceRadiusMiles}
                    onChange={handleChange('serviceRadiusMiles')}
                    className={`mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.serviceRadiusMiles ? 'border-red-400' : 'border-slate-200'}`}
                  />
                </label>
                {errors.serviceRadiusMiles && <p className="text-sm text-red-600">{errors.serviceRadiusMiles}</p>}
                <p className="text-xs text-slate-500">Used to describe the service area on the listing page.</p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Service zone label (optional)
                  <input
                    type="text"
                    value={formData.serviceZoneLabel}
                    onChange={handleChange('serviceZoneLabel')}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Greater Phoenix Metro"
                  />
                </label>
                <p className="text-xs text-slate-500">Shown alongside the service radius when available.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Description (optional)
                <textarea
                  value={formData.description}
                  onChange={handleChange('description')}
                  rows={5}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Share the highlights, equipment list, or service details renters should know."
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                className="w-full rounded-2xl border border-slate-200 px-6 py-3 text-base font-semibold text-slate-600 transition hover:border-slate-300 sm:w-auto"
                onClick={() => navigate('/host/dashboard')}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full rounded-2xl bg-orange-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-80 sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating listing…' : 'Create listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateListingPage;
