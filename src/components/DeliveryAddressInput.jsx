import React, { useState, useCallback } from 'react';
import { MapPin, Truck, Navigation, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { DELIVERY_OPTIONS } from '../lib/utils/deliveryCalculator';

/**
 * DeliveryAddressInput Component
 * 
 * Allows renters to enter their delivery address and see delivery options.
 * Integrates with useDeliveryCalculator hook.
 * 
 * @param {Object} props
 * @param {Function} props.onCalculateDelivery - Called with address to geocode
 * @param {Function} props.onSelectPickup - Called when pickup is selected
 * @param {Function} props.onSelectDelivery - Called when delivery is selected
 * @param {Object} props.deliveryInfo - Current delivery calculation result
 * @param {boolean} props.isPickup - Whether pickup is currently selected
 * @param {boolean} props.isCalculating - Whether geocoding is in progress
 * @param {string} props.error - Error message if any
 * @param {Object} props.deliverySettings - Host's delivery settings
 */
export function DeliveryAddressInput({
  onCalculateDelivery,
  onSelectPickup,
  onSelectDelivery,
  deliveryInfo,
  isPickup,
  isCalculating,
  error,
  deliverySettings,
  className = ''
}) {
  const [address, setAddress] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (address.trim().length >= 5) {
      setHasSearched(true);
      onCalculateDelivery(address.trim());
    }
  }, [address, onCalculateDelivery]);

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
    setHasSearched(false);
  };

  // Determine if pickup-only mode
  const isPickupOnly = deliverySettings?.pickupRequired;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Section header */}
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-900">Delivery or Pickup</h3>
      </div>

      {/* Pickup only notice */}
      {isPickupOnly && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Pickup Only</p>
              <p className="text-xs text-amber-700 mt-1">
                This host requires you to pick up from their location. 
                The exact address will be shared after payment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Address input form */}
      {!isPickupOnly && (
        <>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={address}
                onChange={handleAddressChange}
                placeholder="Enter your event or delivery address"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <button
              type="submit"
              disabled={isCalculating || address.trim().length < 5}
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {isCalculating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking delivery...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Navigation className="h-4 w-4" />
                  Check Delivery Options
                </span>
              )}
            </button>
          </form>

          {/* Error message */}
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600" />
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            </div>
          )}

          {/* Delivery options after calculation */}
          {hasSearched && deliveryInfo && !isCalculating && !error && (
            <DeliveryOptions
              deliveryInfo={deliveryInfo}
              isPickup={isPickup}
              onSelectPickup={onSelectPickup}
              onSelectDelivery={onSelectDelivery}
            />
          )}

          {/* Or pickup option */}
          {!hasSearched && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400">or</span>
              </div>
            </div>
          )}

          {!hasSearched && (
            <button
              type="button"
              onClick={() => {
                onSelectPickup();
                setHasSearched(true);
              }}
              className="w-full rounded-xl border-2 border-slate-200 bg-white p-4 text-left transition hover:border-slate-300"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">I'll pick up</p>
                  <p className="text-xs text-slate-500">Pick up from host's location</p>
                </div>
              </div>
            </button>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Delivery options after address calculation
 */
function DeliveryOptions({ deliveryInfo, isPickup, onSelectPickup, onSelectDelivery }) {
  const { deliveryOption, deliveryFee, deliveryDistance, message } = deliveryInfo;

  // Out of range
  if (deliveryOption === DELIVERY_OPTIONS.OUT_OF_RANGE) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-rose-800">Out of Service Area</p>
            <p className="text-xs text-rose-700 mt-1">{message}</p>
            <p className="text-xs text-rose-600 mt-2">
              This listing cannot deliver to your location and pickup may not be available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Pickup required (beyond delivery zone but within max)
  if (deliveryOption === DELIVERY_OPTIONS.PICKUP_REQUIRED) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Pickup Required</p>
              <p className="text-xs text-amber-700 mt-1">{message}</p>
            </div>
          </div>
        </div>
        <OptionButton
          selected={isPickup}
          onClick={onSelectPickup}
          icon={<MapPin className="h-5 w-5" />}
          label="Pickup"
          description="Pick up from host's location"
          price="No fee"
          priceColor="text-emerald-600"
        />
      </div>
    );
  }

  // Free or paid delivery available
  return (
    <div className="space-y-3">
      {/* Success message */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <p className="text-sm text-emerald-700">
            {deliveryOption === DELIVERY_OPTIONS.FREE_DELIVERY 
              ? 'Free delivery available to your location!' 
              : `Delivery available (${deliveryDistance?.toFixed(1)} miles)`}
          </p>
        </div>
      </div>

      {/* Delivery option */}
      <OptionButton
        selected={!isPickup}
        onClick={onSelectDelivery}
        icon={<Truck className="h-5 w-5" />}
        label={deliveryOption === DELIVERY_OPTIONS.FREE_DELIVERY ? 'Free Delivery' : 'Delivery'}
        description={`${deliveryDistance?.toFixed(1)} miles from host`}
        price={deliveryOption === DELIVERY_OPTIONS.FREE_DELIVERY ? 'FREE' : `+$${deliveryFee?.toFixed(2)}`}
        priceColor={deliveryOption === DELIVERY_OPTIONS.FREE_DELIVERY ? 'text-emerald-600' : 'text-slate-900'}
      />

      {/* Pickup option */}
      <OptionButton
        selected={isPickup}
        onClick={onSelectPickup}
        icon={<MapPin className="h-5 w-5" />}
        label="Pickup"
        description="Pick up from host's location"
        price="No fee"
        priceColor="text-emerald-600"
      />
    </div>
  );
}

/**
 * Reusable option button
 */
function OptionButton({ selected, onClick, icon, label, description, price, priceColor }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border-2 p-4 text-left transition ${
        selected 
          ? 'border-orange-500 bg-orange-50' 
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className={selected ? 'text-orange-600' : 'text-slate-400'}>
            {icon}
          </span>
          <div>
            <p className={`text-sm font-semibold ${selected ? 'text-orange-900' : 'text-slate-700'}`}>
              {label}
            </p>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <span className={`text-sm font-semibold ${priceColor}`}>
          {price}
        </span>
      </div>
    </button>
  );
}

export default DeliveryAddressInput;
