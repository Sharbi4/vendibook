import { useState } from 'react';
import { MapPin, Truck, Zap, Droplet, Ruler } from 'lucide-react';

/**
 * Step 2: Listing Basics
 * Collects title, description, location, specifications, delivery options
 */
export function ListingBasicsStep({ formData, updateFormData }) {
  const { listingMode, listingCategory } = formData;
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(formData.deliveryEnabled);

  const isVehicle = ['food_truck', 'food_trailer'].includes(listingCategory);
  const isEquipment = listingMode === 'equipment';
  const isEventPro = listingMode === 'event_pro';
  const isForSale = listingMode === 'for_sale';

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Listing Details</h2>
        <p className="mt-2 text-slate-600">
          Tell us about your {listingCategory?.replace(/_/g, ' ') || 'listing'}
        </p>
      </div>

      {/* Title & Description */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            placeholder="e.g., 2019 Custom Built Food Truck"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Describe your listing in detail..."
            rows={4}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>
      </section>

      {/* Location */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <MapPin className="h-5 w-5 text-orange-500" />
          Location
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => updateFormData({ city: e.target.value })}
              placeholder="Los Angeles"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => updateFormData({ state: e.target.value })}
              placeholder="CA"
              maxLength={2}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => updateFormData({ zipCode: e.target.value })}
              placeholder="90001"
              maxLength={10}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Service Radius (miles)
            </label>
            <input
              type="number"
              value={formData.serviceRadiusMiles || ''}
              onChange={(e) => updateFormData({ serviceRadiusMiles: parseInt(e.target.value) || 25 })}
              placeholder="25"
              min={1}
              max={500}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>
        </div>
      </section>

      {/* Vehicle Specifications */}
      {(isVehicle || (isForSale && ['food_truck', 'food_trailer', 'vendor_cart'].includes(listingCategory))) && (
        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Ruler className="h-5 w-5 text-orange-500" />
            Specifications
          </h3>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Length (feet)
              </label>
              <input
                type="number"
                value={formData.lengthFeet || ''}
                onChange={(e) => updateFormData({ lengthFeet: parseFloat(e.target.value) || null })}
                placeholder="20"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Width (feet)
              </label>
              <input
                type="number"
                value={formData.widthFeet || ''}
                onChange={(e) => updateFormData({ widthFeet: parseFloat(e.target.value) || null })}
                placeholder="8"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Height (feet)
              </label>
              <input
                type="number"
                value={formData.heightFeet || ''}
                onChange={(e) => updateFormData({ heightFeet: parseFloat(e.target.value) || null })}
                placeholder="10"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          {/* Electrical */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                <Zap className="h-4 w-4" />
                Power Type
              </label>
              <select
                value={formData.powerType}
                onChange={(e) => updateFormData({ powerType: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              >
                <option value="">Select power type</option>
                <option value="110v">110V Standard</option>
                <option value="220v">220V Commercial</option>
                <option value="generator">Generator Included</option>
                <option value="battery">Battery Powered</option>
                <option value="propane">Propane</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                <Droplet className="h-4 w-4" />
                Water System
              </label>
              <select
                value={formData.waterSystem}
                onChange={(e) => updateFormData({ waterSystem: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              >
                <option value="">Select water system</option>
                <option value="self_contained">Self Contained</option>
                <option value="external_hookup">External Hookup</option>
                <option value="both">Both Options</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>

          {/* Water capacities */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fresh Water Capacity (gallons)
              </label>
              <input
                type="number"
                value={formData.freshWaterCapacityGallons || ''}
                onChange={(e) => updateFormData({ freshWaterCapacityGallons: parseFloat(e.target.value) || null })}
                placeholder="50"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Grey Water Capacity (gallons)
              </label>
              <input
                type="number"
                value={formData.greyWaterCapacityGallons || ''}
                onChange={(e) => updateFormData({ greyWaterCapacityGallons: parseFloat(e.target.value) || null })}
                placeholder="50"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          {/* Features checkboxes */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { key: 'generatorIncluded', label: 'Generator Included' },
              { key: 'posSystemIncluded', label: 'POS System Included' },
              { key: 'handWashSinkIncluded', label: 'Hand Wash Sink' },
              { key: 'wheelchairAccessible', label: 'Wheelchair Accessible' },
              { key: 'commercialGradeElectrical', label: 'Commercial Grade Electrical' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData[key] || false}
                  onChange={(e) => updateFormData({ [key]: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </section>
      )}

      {/* Equipment Specifications */}
      {isEquipment && (
        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Ruler className="h-5 w-5 text-orange-500" />
            Equipment Details
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Weight (lbs)
              </label>
              <input
                type="number"
                value={formData.weightLbs || ''}
                onChange={(e) => updateFormData({ weightLbs: parseFloat(e.target.value) || null })}
                placeholder="100"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Equipment Size
              </label>
              <select
                value={formData.equipmentClassification}
                onChange={(e) => updateFormData({ equipmentClassification: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              >
                <option value="">Select size</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {/* Event Pro Details */}
      {isEventPro && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Service Details</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Capacity Served (guests)
              </label>
              <input
                type="number"
                value={formData.capacityServed || ''}
                onChange={(e) => updateFormData({ capacityServed: parseInt(e.target.value) || null })}
                placeholder="100"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>
        </section>
      )}

      {/* Delivery Options */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Truck className="h-5 w-5 text-orange-500" />
          Delivery & Logistics
        </h3>

        <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.deliveryEnabled}
            onChange={(e) => {
              updateFormData({ deliveryEnabled: e.target.checked });
              setShowDeliveryOptions(e.target.checked);
            }}
            className="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
          />
          <div>
            <span className="font-medium text-slate-900">Delivery Available</span>
            <p className="text-sm text-slate-500">I can deliver this to the renter's location</p>
          </div>
        </label>

        {showDeliveryOptions && (
          <div className="space-y-4 pl-4 border-l-2 border-orange-200">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Delivery Model
              </label>
              <select
                value={formData.deliveryModel}
                onChange={(e) => updateFormData({ deliveryModel: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              >
                <option value="pickup_only">Pickup Only</option>
                <option value="flat_fee">Flat Fee</option>
                <option value="mileage_based">Mileage Based</option>
                <option value="delivery_included">Delivery Included</option>
              </select>
            </div>

            {formData.deliveryModel === 'flat_fee' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Flat Delivery Fee ($)
                </label>
                <input
                  type="number"
                  value={formData.deliveryFlatFee || ''}
                  onChange={(e) => updateFormData({ deliveryFlatFee: parseFloat(e.target.value) || 0 })}
                  placeholder="50"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
            )}

            {formData.deliveryModel === 'mileage_based' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Rate per Mile ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.deliveryRatePerMile || ''}
                    onChange={(e) => updateFormData({ deliveryRatePerMile: parseFloat(e.target.value) || 0 })}
                    placeholder="2.50"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Delivery Range (miles)
                  </label>
                  <input
                    type="number"
                    value={formData.deliveryRangeMiles || ''}
                    onChange={(e) => updateFormData({ deliveryRangeMiles: parseInt(e.target.value) || null })}
                    placeholder="50"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              </div>
            )}

            {formData.deliveryModel === 'delivery_included' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Included Miles (free delivery up to)
                </label>
                <input
                  type="number"
                  value={formData.deliveryIncludedMiles || ''}
                  onChange={(e) => updateFormData({ deliveryIncludedMiles: parseInt(e.target.value) || 0 })}
                  placeholder="25"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default ListingBasicsStep;
