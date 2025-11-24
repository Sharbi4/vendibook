import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Check } from 'lucide-react';
import { LISTING_TYPES, PRICE_UNITS, getCategoriesByType, getListingTypeInfo, formatPrice } from '../data/listings';
import { generateListingId } from '../utils/uid';
import ListingCardPreview from '../components/ListingCardPreview';
import SectionHeader from '../components/SectionHeader';
import FormField from '../components/FormField';
import StepNavigation from '../components/StepNavigation';
import PageShell from '../components/layout/PageShell';
import WizardLayout from '../components/layout/WizardLayout';
import VerificationRequired from '../components/VerificationRequired.jsx';
import { useAuth } from '../hooks/useAuth.js';

function HostOnboardingWizard() {
  const navigate = useNavigate();
  const { needsVerification } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listingData, setListingData] = useState({
    listingType: '',
    title: '',
    category: '',
    location: '',
    price: '',
    priceUnit: '',
    amenities: [],
    images: [],
    description: ''
  });

  const updateData = (field, value) => {
    setListingData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tag) => {
    setListingData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(tag)
        ? prev.amenities.filter(t => t !== tag)
        : [...prev.amenities, tag]
    }));
  };

  const isStepComplete = (step) => {
    switch (step) {
      case 1:
        return listingData.listingType !== '';
      case 2:
        return listingData.title && listingData.category && listingData.location;
      case 3:
        return listingData.price && listingData.priceUnit;
      case 4:
        return listingData.amenities.length > 0;
      case 5:
        return listingData.description;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (isStepComplete(currentStep) && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // FRONTEND ONLY: Save to localStorage. Will be replaced with API call in backend integration phase.
      const newListing = {
        id: generateListingId(listingData.listingType, listingData.category),
        title: listingData.title,
        description: listingData.description,
        listingType: listingData.listingType,
        category: listingData.category,
        city: listingData.location.split(',')[0]?.trim() || 'Phoenix',
        state: listingData.location.split(',')[1]?.trim() || 'AZ',
        price: parseFloat(listingData.price),
        priceUnit: listingData.priceUnit,
        tags: listingData.amenities,
        imageUrl: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&auto=format&fit=crop&q=80',
        hostName: 'You',
        isVerified: false,
        deliveryAvailable: listingData.amenities.includes('Delivery Available'),
        rating: 0,
        reviewCount: 0,
        highlights: []
      };

      // Load existing listings from localStorage
      const existingListings = JSON.parse(localStorage.getItem('vendibook_myListings') || '[]');
      existingListings.push(newListing);
      localStorage.setItem('vendibook_myListings', JSON.stringify(existingListings));

      setTimeout(() => {
        navigate('/host/dashboard');
      }, 500);
    } catch (err) {
      alert('Failed to create listing: ' + err.message);
      setIsSubmitting(false);
    }
  };

  // Preview wrapper using existing ListingCardPreview
  const LivePreview = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
      <ListingCardPreview listingData={{ ...listingData, amenities: listingData.amenities }} />
      <div className="p-3 bg-orange-50 rounded-lg text-sm text-gray-600">
        <span className="font-semibold text-orange-600">Tip:</span> This is how your listing will appear to renters.
      </div>
    </div>
  );

  // Step 1: Listing Type
  const Step1 = () => (
    <div>
      <h2 className="text-3xl font-bold mb-3 text-gray-900">What would you like to list?</h2>
      <p className="text-gray-600 mb-8">Choose the type of listing you want to create.</p>
      <div className="grid gap-4">
        {[
          { type: LISTING_TYPES.RENT, label: 'Rent out equipment', desc: 'Food trucks, trailers, ghost kitchens, vending locations' },
          { type: LISTING_TYPES.SALE, label: 'Sell equipment', desc: 'Food trucks, trailers, commercial kitchen equipment' },
          { type: LISTING_TYPES.EVENT_PRO, label: 'Offer professional services', desc: 'Chef, caterer, barista, or event services' }
        ].map(({ type, label, desc }) => (
          <button
            type="button"
            key={type}
            onClick={() => {
              updateData('listingType', type);
              if (type === LISTING_TYPES.RENT) updateData('priceUnit', PRICE_UNITS.PER_DAY);
              else if (type === LISTING_TYPES.SALE) updateData('priceUnit', PRICE_UNITS.ONE_TIME);
              else updateData('priceUnit', PRICE_UNITS.PER_HOUR);
            }}
            className={`text-left p-6 rounded-xl border transition ${listingData.listingType === type ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-400'}`}
            aria-pressed={listingData.listingType === type}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{label}</h3>
            <p className="text-sm text-gray-600">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );

  // Step 2: Basic Info
  const Step2 = () => (
    <div>
      <SectionHeader title="Tell us about your listing" description="Provide the basic details to help customers find your listing" />
      <div className="grid gap-6">
        <FormField label="Listing Title" required type="text" value={listingData.title} onChange={(e) => updateData('title', e.target.value)} placeholder="e.g., Fully Equipped Taco Truck" />
        <FormField label="Category" required type="select" value={listingData.category} onChange={(e) => updateData('category', e.target.value)} options={getCategoriesByType(listingData.listingType).slice(1).map(cat => ({ value: cat.id, label: cat.name }))} />
        <FormField label="Location" required type="text" value={listingData.location} onChange={(e) => updateData('location', e.target.value)} placeholder="e.g., Phoenix, AZ" />
      </div>
    </div>
  );

  // Step 3: Pricing
  const Step3 = () => (
    <div>
      <SectionHeader
        title={`Set your ${listingData.listingType === LISTING_TYPES.SALE ? 'price' : 'rate'}`}
        description={listingData.listingType === LISTING_TYPES.SALE ? 'Set your asking price' : listingData.listingType === LISTING_TYPES.EVENT_PRO ? 'Set your hourly service rate' : 'Set your daily rental rate'}
      />
      <div className="grid gap-6">
        <FormField label={`${listingData.listingType === LISTING_TYPES.SALE ? 'Price' : 'Rate'}`} required type="number" value={listingData.price} onChange={(e) => updateData('price', e.target.value)} placeholder="250" />
        <FormField label="Pricing Unit" required type="select" value={listingData.priceUnit} onChange={(e) => updateData('priceUnit', e.target.value)} options={listingData.listingType === LISTING_TYPES.SALE ? [{ value: PRICE_UNITS.ONE_TIME, label: 'One-time purchase' }] : listingData.listingType === LISTING_TYPES.EVENT_PRO ? [{ value: PRICE_UNITS.PER_HOUR, label: 'Per hour' }] : [{ value: PRICE_UNITS.PER_DAY, label: 'Per day' }]} />
      </div>
    </div>
  );

  // Step 4: Tags/Amenities
  const Step4 = () => {
    const tagOptions = listingData.listingType === LISTING_TYPES.EVENT_PRO ? ['Certified', 'Licensed', 'Insured', 'Menu Planning', 'Catering', 'Bar Service', '10+ Years Exp'] : ['Power', 'Water', 'Propane', 'Full Kitchen', 'Storage', 'WiFi', 'Delivery Available', 'High Foot Traffic'];
    return (
      <div>
        <SectionHeader title="Add features and amenities" description="Select all that apply to your listing" />
        <div className="flex flex-wrap gap-3">
          {tagOptions.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              type="button"
              className={`px-5 py-2.5 rounded-full text-sm font-medium border transition ${listingData.amenities.includes(tag) ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-300 text-gray-600 hover:border-orange-400'}`}
              aria-pressed={listingData.amenities.includes(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Step 5: Description & Photos
  const Step5 = () => (
    <div>
      <SectionHeader title="Add final details" description="Help renters understand what makes your listing special" />
      <div className="grid gap-6">
        <FormField label="Description" required type="textarea" value={listingData.description} onChange={(e) => updateData('description', e.target.value)} placeholder="Describe your listing, what makes it special, and any important details..." />
        <FormField label="Photo URL (optional)" type="text" value={listingData.imageUrl} onChange={(e) => updateData('imageUrl', e.target.value)} placeholder="https://images.unsplash.com/..." />
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      case 4:
        return <Step4 />;
      case 5:
        return <Step5 />;
      default:
        return null;
    }
  };

  if (needsVerification) {
    return (
      <PageShell
        title="Create a New Listing"
        subtitle="Email verification required"
        maxWidth="max-w-4xl"
        action={{ label: 'Back home', onClick: () => navigate('/') }}
      >
        <VerificationRequired
          title="Verify your email before creating listings"
          description="We sent you a verification link. Once you confirm your email, you can start creating listings and earning on Vendibook."
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Create a New Listing"
      subtitle={`Step ${currentStep} of 5`}
      maxWidth="max-w-6xl"
      action={{ label: 'Exit', onClick: () => navigate('/become-host') }}
    >
      <WizardLayout
        currentStep={currentStep}
        totalSteps={5}
        preview={<LivePreview />}
        footer={(
          <StepNavigation
            currentStep={currentStep}
            totalSteps={5}
            isStepValid={isStepComplete(currentStep)}
            onNext={nextStep}
            onPrev={prevStep}
            onComplete={handleComplete}
            isSubmitting={isSubmitting}
          />
        )}
      >
        {renderStep()}
      </WizardLayout>
    </PageShell>
  );
}

export default HostOnboardingWizard;
