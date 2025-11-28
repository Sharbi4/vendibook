import React, { useMemo } from 'react';
import { Truck, Package, Percent, CreditCard, MapPin, Calendar, Clock } from 'lucide-react';
import { calculateRentalFees, calculateRentalPrice, getPricingSummary, FEE_RATES } from '../lib/utils/feeCalculator';
import { DELIVERY_OPTIONS, formatDeliveryInfo } from '../lib/utils/deliveryCalculator';

/**
 * BookingSummary Component
 * 
 * Displays full pricing breakdown for a rental booking:
 * - Base price (rate × days)
 * - Delivery fee (if applicable)
 * - Upsells/add-ons
 * - 13% renter service fee
 * - Total amount due
 * 
 * @param {Object} props
 * @param {Object} props.listing - Listing data with pricing
 * @param {number} props.rentalDays - Number of days renting
 * @param {Object} props.deliveryInfo - Delivery calculation result
 * @param {Array} props.selectedUpsells - Array of selected upsell items
 * @param {string} props.startDate - Start date string
 * @param {string} props.endDate - End date string
 * @param {boolean} props.isPickup - Whether pickup is selected
 */
export function BookingSummary({
  listing,
  rentalDays = 1,
  deliveryInfo = null,
  selectedUpsells = [],
  startDate,
  endDate,
  isPickup = false,
  className = ''
}) {
  // Calculate rental price based on duration
  const rentalPrice = useMemo(() => {
    if (!listing?.price) return null;
    
    return calculateRentalPrice({
      dailyRate: Number(listing.price) || 0,
      weeklyRate: listing.weeklyRate || listing.weekly_rate || null,
      monthlyRate: listing.monthlyRate || listing.monthly_rate || null,
      rentalDays: Math.max(1, rentalDays)
    });
  }, [listing?.price, listing?.weeklyRate, listing?.weekly_rate, listing?.monthlyRate, listing?.monthly_rate, rentalDays]);

  // Calculate upsell total
  const upsellTotal = useMemo(() => {
    return selectedUpsells.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  }, [selectedUpsells]);

  // Calculate delivery fee
  const deliveryFee = useMemo(() => {
    if (isPickup) return 0;
    if (!deliveryInfo) return 0;
    if (deliveryInfo.deliveryOption === DELIVERY_OPTIONS.FREE_DELIVERY) return 0;
    if (deliveryInfo.deliveryOption === DELIVERY_OPTIONS.PAID_DELIVERY) {
      return deliveryInfo.deliveryFee || 0;
    }
    return 0;
  }, [deliveryInfo, isPickup]);

  // Calculate full fee breakdown
  const fees = useMemo(() => {
    if (!rentalPrice) return null;
    
    return calculateRentalFees({
      basePrice: rentalPrice.basePrice,
      deliveryFee,
      upsellTotal
    });
  }, [rentalPrice, deliveryFee, upsellTotal]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!listing || !fees) {
    return (
      <div className={`rounded-2xl border border-slate-200 bg-white p-5 ${className}`}>
        <p className="text-sm text-slate-500">Select dates to see pricing</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-900">Booking Summary</h3>
        {startDate && (
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(startDate)} → {formatDate(endDate)}</span>
            <span className="text-slate-400">•</span>
            <span className="font-medium">{rentalDays} day{rentalDays !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <div className="px-5 py-4 space-y-3">
        {/* Base price */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-sm text-slate-700">
                {formatCurrency(listing.price)} × {rentalDays} day{rentalDays !== 1 ? 's' : ''}
              </p>
              {rentalPrice?.pricingType !== 'daily' && (
                <p className="text-xs text-emerald-600">
                  {rentalPrice.pricingType === 'weekly' ? 'Weekly rate applied' : 'Monthly rate applied'}
                </p>
              )}
            </div>
          </div>
          <span className="text-sm font-medium text-slate-900">
            {formatCurrency(rentalPrice.basePrice)}
          </span>
        </div>

        {/* Delivery fee */}
        {deliveryFee > 0 && (
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-sm text-slate-700">Delivery</p>
                {deliveryInfo && (
                  <p className="text-xs text-slate-500">
                    {deliveryInfo.deliveryDistance?.toFixed(1)} miles
                  </p>
                )}
              </div>
            </div>
            <span className="text-sm font-medium text-slate-900">
              {formatCurrency(deliveryFee)}
            </span>
          </div>
        )}

        {/* Free delivery badge */}
        {deliveryInfo?.deliveryOption === DELIVERY_OPTIONS.FREE_DELIVERY && !isPickup && (
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-500" />
              <p className="text-sm text-emerald-700">Free delivery included</p>
            </div>
            <span className="text-sm font-medium text-emerald-600">
              $0.00
            </span>
          </div>
        )}

        {/* Pickup */}
        {isPickup && (
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <p className="text-sm text-slate-700">Pickup selected</p>
            </div>
            <span className="text-sm font-medium text-slate-600">
              No delivery fee
            </span>
          </div>
        )}

        {/* Upsells */}
        {selectedUpsells.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Add-ons</p>
            {selectedUpsells.map((upsell, idx) => (
              <div key={upsell.id || idx} className="flex items-start justify-between">
                <p className="text-sm text-slate-700">{upsell.name}</p>
                <span className="text-sm font-medium text-slate-900">
                  {formatCurrency(upsell.price)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Subtotal */}
        <div className="flex items-start justify-between pt-3 border-t border-slate-100">
          <p className="text-sm font-medium text-slate-700">Subtotal</p>
          <span className="text-sm font-semibold text-slate-900">
            {formatCurrency(fees.subtotal)}
          </span>
        </div>

        {/* Service fee */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-sm text-slate-700">Service fee (13%)</p>
              <p className="text-xs text-slate-500">Protects your booking</p>
            </div>
          </div>
          <span className="text-sm font-medium text-slate-900">
            {formatCurrency(fees.renterServiceFee)}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 rounded-b-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-slate-500" />
            <p className="text-base font-semibold text-slate-900">Total due</p>
          </div>
          <span className="text-xl font-bold text-slate-900">
            {formatCurrency(fees.totalRenterPays)}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Payment charged after host approves your request
        </p>
      </div>
    </div>
  );
}

/**
 * Compact price line for inline display
 */
export function BookingPricePreview({ basePrice, rentalDays, serviceFeePercent = 13 }) {
  const subtotal = basePrice * rentalDays;
  const serviceFee = subtotal * (serviceFeePercent / 100);
  const total = subtotal + serviceFee;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="text-sm text-slate-600">
      <span className="font-semibold text-slate-900">{formatCurrency(total)}</span>
      <span className="ml-1">total</span>
      <span className="text-slate-400 ml-1">
        ({formatCurrency(basePrice)}/day × {rentalDays} + fees)
      </span>
    </div>
  );
}

/**
 * Delivery option selector component
 */
export function DeliveryOptionSelector({ 
  deliveryInfo, 
  isPickup, 
  onSelectPickup, 
  onSelectDelivery,
  className = ''
}) {
  if (!deliveryInfo) return null;

  const { deliveryOption, deliveryFee, deliveryDistance, message } = deliveryInfo;

  // Out of range - show error
  if (deliveryOption === DELIVERY_OPTIONS.OUT_OF_RANGE) {
    return (
      <div className={`rounded-xl border border-rose-200 bg-rose-50 p-4 ${className}`}>
        <p className="text-sm font-medium text-rose-800">Out of Service Area</p>
        <p className="text-xs text-rose-600 mt-1">{message}</p>
      </div>
    );
  }

  // Pickup only
  if (deliveryOption === DELIVERY_OPTIONS.PICKUP_REQUIRED) {
    return (
      <div className={`rounded-xl border border-amber-200 bg-amber-50 p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-amber-600" />
          <p className="text-sm font-medium text-amber-800">Pickup Required</p>
        </div>
        <p className="text-xs text-amber-600 mt-1">{message}</p>
      </div>
    );
  }

  // Show delivery/pickup options
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Delivery option */}
      {(deliveryOption === DELIVERY_OPTIONS.FREE_DELIVERY || deliveryOption === DELIVERY_OPTIONS.PAID_DELIVERY) && (
        <button
          type="button"
          onClick={onSelectDelivery}
          className={`w-full rounded-xl border-2 p-4 text-left transition ${
            !isPickup 
              ? 'border-orange-500 bg-orange-50' 
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Truck className={`h-5 w-5 ${!isPickup ? 'text-orange-600' : 'text-slate-400'}`} />
              <div>
                <p className={`text-sm font-semibold ${!isPickup ? 'text-orange-900' : 'text-slate-700'}`}>
                  {deliveryOption === DELIVERY_OPTIONS.FREE_DELIVERY ? 'Free Delivery' : 'Delivery'}
                </p>
                <p className="text-xs text-slate-500">
                  {deliveryDistance?.toFixed(1)} miles from host
                </p>
              </div>
            </div>
            <span className={`text-sm font-semibold ${
              deliveryOption === DELIVERY_OPTIONS.FREE_DELIVERY 
                ? 'text-emerald-600' 
                : 'text-slate-900'
            }`}>
              {deliveryOption === DELIVERY_OPTIONS.FREE_DELIVERY 
                ? 'FREE' 
                : `+$${deliveryFee?.toFixed(2)}`}
            </span>
          </div>
        </button>
      )}

      {/* Pickup option */}
      <button
        type="button"
        onClick={onSelectPickup}
        className={`w-full rounded-xl border-2 p-4 text-left transition ${
          isPickup 
            ? 'border-orange-500 bg-orange-50' 
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <MapPin className={`h-5 w-5 ${isPickup ? 'text-orange-600' : 'text-slate-400'}`} />
            <div>
              <p className={`text-sm font-semibold ${isPickup ? 'text-orange-900' : 'text-slate-700'}`}>
                Pickup
              </p>
              <p className="text-xs text-slate-500">
                Pick up from host location
              </p>
            </div>
          </div>
          <span className="text-sm font-semibold text-emerald-600">
            No fee
          </span>
        </div>
      </button>
    </div>
  );
}

export default BookingSummary;
