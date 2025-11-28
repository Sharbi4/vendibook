import { useState } from 'react';
import { 
  MapPin, Calendar, DollarSign, Image, FileText, 
  Truck, Clock, Check, AlertCircle, ChevronDown, ChevronUp 
} from 'lucide-react';

// Listing type display names
const LISTING_TYPE_LABELS = {
  food_truck: 'Food Truck',
  food_trailer: 'Food Trailer',
  ghost_kitchen: 'Ghost Kitchen',
  equipment_rental: 'Equipment Rental',
  vendor_event_space: 'Vendor/Event Space',
  event_pro_service: 'Event Pro Service',
  generator: 'Generator',
  smoker: 'Smoker',
  pos_terminal: 'POS Terminal',
  tent_canopy: 'Tent/Canopy',
  lighting: 'Lighting',
  water_tank: 'Water Tank',
  cookware: 'Cookware',
  catering: 'Catering',
  bartending: 'Bartending',
  coffee_beverage: 'Coffee & Beverage',
  dessert_sweets: 'Desserts & Sweets',
  dj_entertainment: 'DJ/Entertainment'
};

/**
 * Step 7: Review & Publish
 * Full listing preview and confirmation
 */
export function ReviewStep({ formData, onSubmit, isSubmitting }) {
  const [expandedSections, setExpandedSections] = useState({
    basics: true,
    availability: true,
    pricing: true,
    media: true,
    documents: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getModeName = (mode) => {
    const names = {
      rental: 'Rental Listing',
      event_pro: 'Event Professional',
      equipment: 'Equipment Rental',
      for_sale: 'For Sale'
    };
    return names[mode] || mode;
  };

  const getTypeName = (type) => {
    return LISTING_TYPE_LABELS[type] || type;
  };

  const formatPrice = (price) => {
    if (!price) return 'Not set';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const SectionHeader = ({ title, icon: Icon, section, complete }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-orange-500" />
        <span className="font-semibold text-slate-900">{title}</span>
        {complete && <Check className="h-4 w-4 text-emerald-500" />}
      </div>
      {expandedSections[section] 
        ? <ChevronUp className="h-5 w-5 text-slate-400" />
        : <ChevronDown className="h-5 w-5 text-slate-400" />
      }
    </button>
  );

  const DetailRow = ({ label, value }) => (
    <div className="flex justify-between py-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value || 'Not set'}</span>
    </div>
  );

  // Validation summary
  const issues = [];
  if (!formData.title) issues.push('Missing listing title');
  if (!formData.heroImage) issues.push('Missing hero image');
  if (!formData.baseHourlyPrice && !formData.baseDailyPrice && !formData.flatEventPrice && !formData.salePrice) {
    issues.push('No pricing set');
  }
  if (!formData.city) issues.push('Incomplete location');

  const isReady = issues.length === 0;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Review Your Listing</h2>
        <p className="mt-2 text-slate-600">
          Double-check all details before publishing
        </p>
      </div>

      {/* Validation Issues */}
      {!isReady && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900">Please fix these issues</h4>
              <ul className="mt-2 space-y-1 text-sm text-red-700">
                {issues.map((issue, i) => (
                  <li key={i}>• {issue}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Preview Card */}
      {formData.heroImage && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
          <div className="aspect-video relative">
            <img
              src={formData.heroImage}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
              {getTypeName(formData.listingCategory)}
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-xl font-bold text-slate-900 truncate">
              {formData.title || 'Your Listing Title'}
            </h3>
            <p className="text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {formData.city && formData.state 
                ? `${formData.city}, ${formData.state}`
                : 'Location'
              }
            </p>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
              {formData.baseHourlyPrice && (
                <span className="text-lg font-bold text-orange-600">
                  ${formData.baseHourlyPrice}/hr
                </span>
              )}
              {formData.baseDailyPrice && (
                <span className="text-lg font-bold text-orange-600">
                  ${formData.baseDailyPrice}/day
                </span>
              )}
              {formData.flatEventPrice && (
                <span className="text-lg font-bold text-orange-600">
                  ${formData.flatEventPrice} flat
                </span>
              )}
              {formData.salePrice && (
                <span className="text-lg font-bold text-orange-600">
                  ${formData.salePrice}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Basics Section */}
      <div className="space-y-3">
        <SectionHeader 
          title="Basic Details" 
          icon={Truck} 
          section="basics"
          complete={formData.title && formData.description}
        />
        {expandedSections.basics && (
          <div className="px-4 py-3 bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            <DetailRow label="Listing Mode" value={getModeName(formData.listingMode)} />
            <DetailRow label="Type" value={getTypeName(formData.listingCategory)} />
            <DetailRow label="Title" value={formData.title} />
            <div className="py-2">
              <span className="text-slate-500 block mb-1">Description</span>
              <p className="text-slate-900 text-sm">
                {formData.description || 'No description provided'}
              </p>
            </div>
            <DetailRow label="Location" value={
              formData.city && formData.state 
                ? `${formData.city}, ${formData.state}` 
                : null
            } />
            <DetailRow label="Service Radius" value={
              formData.serviceRadiusMiles ? `${formData.serviceRadiusMiles} miles` : null
            } />
            <DetailRow label="Delivery Available" value={
              formData.deliveryEnabled ? 'Yes' : 'No'
            } />
          </div>
        )}
      </div>

      {/* Availability Section */}
      <div className="space-y-3">
        <SectionHeader 
          title="Availability" 
          icon={Calendar} 
          section="availability"
          complete={true}
        />
        {expandedSections.availability && (
          <div className="px-4 py-3 bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            <DetailRow label="Minimum Hours" value={formData.minimumRentalHours} />
            <DetailRow label="Maximum Hours" value={formData.maximumRentalHours} />
            <DetailRow label="Lead Time" value={
              formData.leadTimeDays ? `${formData.leadTimeDays} days` : null
            } />
            <DetailRow label="Blackout Dates" value={
              formData.blackoutDates?.length 
                ? `${formData.blackoutDates.length} dates blocked`
                : 'None'
            } />
          </div>
        )}
      </div>

      {/* Pricing Section */}
      <div className="space-y-3">
        <SectionHeader 
          title="Pricing" 
          icon={DollarSign} 
          section="pricing"
          complete={formData.baseHourlyPrice || formData.baseDailyPrice || formData.flatEventPrice || formData.salePrice}
        />
        {expandedSections.pricing && (
          <div className="px-4 py-3 bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {formData.baseHourlyPrice && (
              <DetailRow label="Hourly Rate" value={formatPrice(formData.baseHourlyPrice)} />
            )}
            {formData.baseDailyPrice && (
              <DetailRow label="Daily Rate" value={formatPrice(formData.baseDailyPrice)} />
            )}
            {formData.flatEventPrice && (
              <DetailRow label="Flat Rate" value={formatPrice(formData.flatEventPrice)} />
            )}
            {formData.salePrice && (
              <DetailRow label="Sale Price" value={formatPrice(formData.salePrice)} />
            )}
            <DetailRow label="Security Deposit" value={
              formData.depositRequired ? formatPrice(formData.depositAmount) : 'None'
            } />
            <DetailRow label="Cleaning Fee" value={
              formData.cleaningFee ? formatPrice(formData.cleaningFee) : 'None'
            } />
            {formData.tierPricing?.length > 0 && (
              <DetailRow label="Pricing Tiers" value={`${formData.tierPricing.length} tiers`} />
            )}
            {formData.addonItems?.length > 0 && (
              <DetailRow label="Add-ons" value={`${formData.addonItems.length} items`} />
            )}
          </div>
        )}
      </div>

      {/* Media Section */}
      <div className="space-y-3">
        <SectionHeader 
          title="Photos & Media" 
          icon={Image} 
          section="media"
          complete={!!formData.heroImage}
        />
        {expandedSections.media && (
          <div className="px-4 py-3 bg-white rounded-xl border border-slate-200">
            <div className="grid grid-cols-4 gap-2">
              {formData.heroImage && (
                <div className="col-span-2 row-span-2 aspect-square rounded-lg overflow-hidden border-2 border-orange-500">
                  <img src={formData.heroImage} alt="Hero" className="w-full h-full object-cover" />
                </div>
              )}
              {formData.gallery?.slice(0, 4).map((img, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden border border-slate-200">
                  <img src={img.url || img} alt={`Gallery ${i+1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            {formData.videoUrl && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <DetailRow label="Video URL" value={formData.videoUrl} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Documents Section */}
      <div className="space-y-3">
        <SectionHeader 
          title="Documents" 
          icon={FileText} 
          section="documents"
          complete={true}
        />
        {expandedSections.documents && (
          <div className="px-4 py-3 bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            <DetailRow label="Insurance Required" value={
              formData.insuranceRequired ? 'Yes' : 'No'
            } />
            <DetailRow label="Permit Required" value={
              formData.permitRequired ? 'Yes' : 'No'
            } />
            <DetailRow label="Documents Uploaded" value={
              formData.documentUploads?.length 
                ? `${formData.documentUploads.length} files`
                : 'None'
            } />
            {formData.listingMode === 'for_sale' && (
              <>
                <DetailRow label="Title Document" value={
                  formData.titleDocument ? 'Uploaded' : 'Not uploaded'
                } />
                <DetailRow label="VIN/Serial" value={formData.vinOrSerialNumber} />
                <DetailRow label="Inspection Report" value={
                  formData.inspectionReport ? 'Uploaded' : 'Not uploaded'
                } />
              </>
            )}
          </div>
        )}
      </div>

      {/* Terms Agreement */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="h-5 w-5 mt-0.5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
            // Would track terms acceptance in real implementation
          />
          <span className="text-sm text-slate-600">
            I confirm that all information provided is accurate and I agree to 
            VendiBook's <a href="/terms" className="text-orange-600 hover:underline">Terms of Service</a> and{' '}
            <a href="/host-policies" className="text-orange-600 hover:underline">Host Policies</a>.
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={!isReady || isSubmitting}
        className={`
          w-full py-4 rounded-xl font-semibold text-lg transition-all
          ${isReady && !isSubmitting
            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.01]'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }
        `}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Publishing...
          </span>
        ) : (
          'Publish Listing'
        )}
      </button>

      {/* Save Draft */}
      <button
        className="w-full py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
      >
        Save as Draft
      </button>
    </div>
  );
}

export default ReviewStep;
