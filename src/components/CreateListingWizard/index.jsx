import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// Step components
import { ListingModeStep } from './steps/ListingModeStep';
import { ListingTypeStep } from './steps/ListingTypeStep';
import { ListingBasicsStep } from './steps/ListingBasicsStep';
import { AvailabilityStep } from './steps/AvailabilityStep';
import { PricingStep } from './steps/PricingStep';
import { MediaStep } from './steps/MediaStep';
import { ComplianceStep } from './steps/ComplianceStep';
import { ReviewStep } from './steps/ReviewStep';

/**
 * Creative Listing Wizard
 * Seven step flow for creating a complete listing
 */
export function CreateListingWizard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Wizard form data
  const [formData, setFormData] = useState({
    // Step 0: Mode selection
    listingMode: null, // rental, event_pro, equipment, for_sale
    
    // Step 1: Type selection
    listingCategory: null,
    listingType: null,
    
    // Step 2: Basics
    title: '',
    description: '',
    latitude: null,
    longitude: null,
    maskedAddress: '',
    fullAddress: '',
    zipCode: '',
    city: '',
    state: '',
    serviceRadiusMiles: 25,
    deliveryEnabled: false,
    deliveryModel: 'pickup_only',
    deliveryRangeMiles: null,
    deliveryFlatFee: 0,
    deliveryRatePerMile: 0,
    deliveryIncludedMiles: 0,
    
    // Specifications
    lengthFeet: null,
    widthFeet: null,
    heightFeet: null,
    weightLbs: null,
    powerType: '',
    electricalRequirements: '',
    waterSystem: '',
    freshWaterCapacityGallons: null,
    greyWaterCapacityGallons: null,
    ventilationInfo: '',
    capacityServed: null,
    equipmentClassification: '',
    vendingWindowCount: null,
    generatorIncluded: false,
    posSystemIncluded: false,
    handWashSinkIncluded: false,
    wheelchairAccessible: false,
    commercialGradeElectrical: false,
    certifiedKitchenRating: '',
    
    // Step 3: Availability
    blackoutDates: [],
    blackoutRanges: [],
    weekdayAvailability: {
      mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true
    },
    eventHours: { start: '09:00', end: '22:00' },
    minimumRentalHours: 1,
    maximumRentalHours: null,
    minimumRentalDays: 1,
    maximumRentalDays: null,
    leadTimeDays: 1,
    instantBookEnabled: false,
    alwaysAvailable: false,
    
    // Step 4: Pricing
    baseHourlyPrice: null,
    baseDailyPrice: null,
    flatEventPrice: null,
    tierPricing: [],
    addonItems: [],
    depositRequired: false,
    depositAmount: 0,
    cleaningFee: 0,
    damageWaiver: 0,
    multiDayDiscountPercent: 0,
    salePrice: null,
    
    // Step 5: Media
    heroImage: null,
    gallery: [],
    videoUrl: '',
    
    // Step 6: Compliance
    documentUploads: [],
    documentCategoryGroup: '',
    permitRequired: false,
    insuranceRequired: false,
    titleDocument: null,
    vinOrSerialNumber: '',
    inspectionReport: null,
    notaryServiceAvailable: false
  });

  const steps = [
    { id: 'mode', title: 'What are you listing?', component: ListingModeStep },
    { id: 'type', title: 'Listing Type', component: ListingTypeStep },
    { id: 'basics', title: 'Listing Basics', component: ListingBasicsStep },
    { id: 'availability', title: 'Availability', component: AvailabilityStep },
    { id: 'pricing', title: 'Pricing', component: PricingStep },
    { id: 'media', title: 'Photos & Media', component: MediaStep },
    { id: 'compliance', title: 'Documents', component: ComplianceStep },
    { id: 'review', title: 'Review & Publish', component: ReviewStep }
  ];

  const updateFormData = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setSubmitError(null);
  }, []);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0:
        return !!formData.listingMode;
      case 1:
        return !!formData.listingCategory;
      case 2:
        return !!formData.title && !!formData.city;
      case 3:
        // Availability is optional for for_sale
        return formData.listingMode === 'for_sale' || true;
      case 4:
        // Must have at least one price
        return !!(formData.baseHourlyPrice || formData.baseDailyPrice || 
                  formData.flatEventPrice || formData.salePrice);
      case 5:
        return !!formData.heroImage;
      case 6:
        return true; // Documents are optional
      case 7:
        return true; // Review step
      default:
        return true;
    }
  }, [currentStep, formData]);

  const handleNext = () => {
    if (canProceed() && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSaveDraft = async () => {
    await submitListing('draft');
  };

  const handlePublish = async () => {
    await submitListing('active');
  };

  const submitListing = async (status) => {
    if (!isAuthenticated || !user?.id) {
      setSubmitError('Please sign in to create a listing');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          status
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate to success page or listing
        navigate(`/host/listings?created=${data.data.listingId}`);
      } else {
        setSubmitError(data.message || 'Failed to create listing');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError('An error occurred while saving the listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepComponent = steps[currentStep].component;
  const isLastStep = currentStep === steps.length - 1;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Sign In Required</h2>
          <p className="text-slate-600 mb-6">Please sign in to create a listing.</p>
          <button
            onClick={() => navigate('/signin?redirect=/create-listing')}
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-white font-semibold"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/host/listings')}
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-5 w-5" />
              Exit
            </button>
            <h1 className="text-lg font-semibold text-slate-900">Create Listing</h1>
            <button
              onClick={handleSaveDraft}
              disabled={isSubmitting || !formData.title}
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mx-auto max-w-4xl px-4 pb-4 sm:px-6">
          <div className="flex items-center gap-2">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex-1">
                <div
                  className={`h-1.5 rounded-full transition-colors ${
                    idx < currentStep
                      ? 'bg-orange-500'
                      : idx === currentStep
                        ? 'bg-orange-300'
                        : 'bg-slate-200'
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{steps[currentStep].title}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <StepComponent
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
            {submitError}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {isLastStep ? (
            <button
              onClick={handlePublish}
              disabled={isSubmitting || !canProceed()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Publish Listing
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default CreateListingWizard;
