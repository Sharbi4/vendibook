import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Calendar, Clock, MapPin, Truck, Package, 
  ChevronRight, CreditCard, Shield, AlertCircle,
  Check, Loader2, ArrowLeft
} from 'lucide-react';
import { BookingSummary, DeliveryOptionSelector } from './BookingSummary';
import { useBookingCheckout } from '../hooks/useBookingCheckout';
import { useDeliveryCalculator } from '../hooks/useDeliveryCalculator';
import { useAuth } from '../hooks/useAuth';

/**
 * BookingCheckoutModal
 * 
 * Full-screen modal for rental booking checkout with Stripe integration.
 * 
 * Flow:
 * 1. Review dates (pre-filled from listing page)
 * 2. Select delivery or pickup
 * 3. Optional upsells
 * 4. Review fees & total
 * 5. Proceed to Stripe checkout
 */
export function BookingCheckoutModal({
  isOpen,
  onClose,
  listing,
  initialStartDate = null,
  initialEndDate = null,
  initialBookingMode = 'daily',
  initialPickupTime = '08:00',
  initialReturnTime = '18:00',
  initialEventStartTime = '',
  initialEventEndTime = '',
}) {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1); // 1: Details, 2: Delivery, 3: Review
  const [email, setEmail] = useState('');

  // Initialize checkout hook
  const checkout = useBookingCheckout(listing, {
    onSuccess: (data) => {
      console.log('Checkout session created:', data);
    },
    onError: (err) => {
      console.error('Checkout error:', err);
    }
  });

  // Initialize delivery calculator
  const delivery = useDeliveryCalculator(listing);

  // Set initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      checkout.setStartDate(initialStartDate);
      checkout.setEndDate(initialEndDate);
      checkout.setBookingMode(initialBookingMode);
      checkout.setPickupTime(initialPickupTime);
      checkout.setReturnTime(initialReturnTime);
      checkout.setEventStartTime(initialEventStartTime);
      checkout.setEventEndTime(initialEventEndTime);
      setStep(1);
      
      // Set user email if authenticated
      if (user?.email) {
        setEmail(user.email);
      }
    }
  }, [isOpen]);

  // Sync delivery info with checkout
  useEffect(() => {
    checkout.setDeliveryInfo(delivery.deliveryInfo);
  }, [delivery.deliveryInfo]);

  useEffect(() => {
    checkout.setIsPickup(delivery.isPickup);
  }, [delivery.isPickup]);

  // Check if listing supports delivery
  const hasDeliveryOptions = useMemo(() => {
    if (!listing) return false;
    const freeRadius = listing.freeDeliveryRadius || listing.free_delivery_radius || 0;
    const paidRadius = listing.paidDeliveryRadius || listing.paid_delivery_radius || 0;
    return freeRadius > 0 || paidRadius > 0;
  }, [listing]);

  // Available upsells for this listing
  const availableUpsells = useMemo(() => {
    if (!listing) return [];
    
    // Standard upsells available for rentals
    const upsells = [];
    
    if (listing.insuranceAvailable || listing.insurance_available) {
      upsells.push({
        id: 'insurance',
        name: 'Damage Protection',
        description: 'Coverage for accidental damage during rental',
        price: Math.round(Number(listing.price) * 0.10) || 25
      });
    }
    
    if (listing.generatorAvailable || listing.generator_available) {
      upsells.push({
        id: 'generator',
        name: 'Generator Rental',
        description: 'Portable generator for off-grid operation',
        price: 75
      });
    }
    
    if (listing.cleaningAvailable || listing.cleaning_available) {
      upsells.push({
        id: 'cleaning',
        name: 'Deep Cleaning Service',
        description: 'Professional cleaning before return',
        price: 150
      });
    }
    
    if (listing.trainingAvailable || listing.training_available) {
      upsells.push({
        id: 'training',
        name: 'Equipment Training',
        description: '1-hour training session with host',
        price: 100
      });
    }
    
    // Always offer these
    upsells.push({
      id: 'early-pickup',
      name: 'Early Pickup',
      description: 'Pick up 2 hours earlier than standard time',
      price: 50
    });
    
    upsells.push({
      id: 'late-return',
      name: 'Late Return',
      description: 'Return 2 hours later than standard time',
      price: 50
    });
    
    return upsells;
  }, [listing]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Select date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!isAuthenticated && !email) {
      checkout.setError('Please enter your email to continue');
      return;
    }
    
    await checkout.redirectToCheckout(email || user?.email);
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {step > 1 && (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                  </button>
                )}
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {step === 1 && 'Review Booking Details'}
                    {step === 2 && 'Delivery or Pickup'}
                    {step === 3 && 'Confirm & Pay'}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Step {step} of 3
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4 flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    s <= step ? 'bg-orange-500' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* Step 1: Review Details */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Listing summary */}
                <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                  {listing?.imageUrl && (
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {listing?.title || 'Rental'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {formatCurrency(listing?.price)}/day
                    </p>
                    {listing?.city && (
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {listing.city}, {listing.state}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">Booking Dates</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 border border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">Start</p>
                      <p className="font-semibold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        {formatDate(checkout.startDate)}
                      </p>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">End</p>
                      <p className="font-semibold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        {formatDate(checkout.endDate)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    {checkout.rentalDays} day{checkout.rentalDays !== 1 ? 's' : ''} total
                  </p>
                </div>

                {/* Times for daily-with-time mode */}
                {checkout.bookingMode === 'daily-with-time' && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700">Pickup & Return Times</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 border border-slate-200 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">Pickup</p>
                        <p className="font-semibold text-slate-900 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-500" />
                          {checkout.pickupTime}
                        </p>
                      </div>
                      <div className="p-4 border border-slate-200 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">Return</p>
                        <p className="font-semibold text-slate-900 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-500" />
                          {checkout.returnTime}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Times for hourly mode */}
                {checkout.bookingMode === 'hourly' && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700">Event Times</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 border border-slate-200 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">Start</p>
                        <p className="font-semibold text-slate-900 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-500" />
                          {checkout.eventStartTime || 'Select'}
                        </p>
                      </div>
                      <div className="p-4 border border-slate-200 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">End</p>
                        <p className="font-semibold text-slate-900 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-500" />
                          {checkout.eventEndTime || 'Select'}
                        </p>
                      </div>
                    </div>
                    {checkout.rentalHours > 0 && (
                      <p className="text-sm text-slate-600">
                        {checkout.rentalHours} hour{checkout.rentalHours !== 1 ? 's' : ''} total
                      </p>
                    )}
                  </div>
                )}

                {/* Quick price preview */}
                {checkout.fees && (
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Estimated total</span>
                      <span className="text-lg font-bold text-slate-900">
                        {formatCurrency(checkout.fees.totalRenterPays)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Includes 13% service fee • Final total after delivery selection
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Delivery Options */}
            {step === 2 && (
              <div className="space-y-6">
                {hasDeliveryOptions ? (
                  <>
                    {/* Delivery address input */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-700">
                        Enter your address for delivery options
                      </h4>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="123 Main St, City, State"
                          value={delivery.renterAddress}
                          onChange={(e) => delivery.setRenterAddress(e.target.value)}
                          onBlur={() => {
                            if (delivery.renterAddress.length > 5) {
                              delivery.calculateDelivery(delivery.renterAddress);
                            }
                          }}
                          className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>
                      {delivery.isCalculating && (
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Calculating delivery options...
                        </p>
                      )}
                      {delivery.error && (
                        <p className="text-sm text-rose-600 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {delivery.error}
                        </p>
                      )}
                    </div>

                    {/* Delivery options */}
                    <DeliveryOptionSelector
                      deliveryInfo={delivery.deliveryInfo}
                      isPickup={delivery.isPickup}
                      onSelectPickup={delivery.selectPickup}
                      onSelectDelivery={delivery.selectDelivery}
                    />

                    {/* Delivery info */}
                    {!delivery.isPickup && delivery.deliveryInfo && (
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-start gap-3">
                          <Truck className="w-5 h-5 text-slate-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              Delivery Details
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                              {delivery.deliveryInfo.deliveryDistance?.toFixed(1)} miles from host
                            </p>
                            {checkout.deliveryFee > 0 && (
                              <p className="text-sm font-semibold text-slate-900 mt-1">
                                Delivery fee: {formatCurrency(checkout.deliveryFee)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h4 className="font-semibold text-slate-900 mb-2">Pickup Only</h4>
                    <p className="text-sm text-slate-500">
                      This listing requires pickup from the host location. 
                      Full address will be shared after booking is confirmed.
                    </p>
                    <button
                      onClick={() => {
                        delivery.selectPickup();
                        setStep(3);
                      }}
                      className="mt-4 px-6 py-2 bg-slate-100 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
                    >
                      Continue with Pickup
                    </button>
                  </div>
                )}

                {/* Upsells */}
                {availableUpsells.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-700">
                      Optional Add-ons
                    </h4>
                    <div className="grid gap-2">
                      {availableUpsells.map((upsell) => {
                        const isSelected = checkout.selectedUpsells.some(u => u.id === upsell.id);
                        return (
                          <button
                            key={upsell.id}
                            onClick={() => checkout.toggleUpsell(upsell)}
                            className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition ${
                              isSelected
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                              isSelected ? 'border-orange-500 bg-orange-500' : 'border-slate-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${isSelected ? 'text-orange-900' : 'text-slate-700'}`}>
                                {upsell.name}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {upsell.description}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-slate-900">
                              +{formatCurrency(upsell.price)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review & Pay */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Full booking summary */}
                <BookingSummary
                  listing={listing}
                  rentalDays={checkout.rentalDays}
                  deliveryInfo={delivery.deliveryInfo}
                  selectedUpsells={checkout.selectedUpsells}
                  startDate={checkout.startDate}
                  endDate={checkout.endDate}
                  isPickup={delivery.isPickup}
                />

                {/* Email for guest checkout */}
                {!isAuthenticated && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700">
                      Contact Information
                    </h4>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                    <p className="text-xs text-slate-500">
                      We'll send your booking confirmation to this email
                    </p>
                  </div>
                )}

                {/* Trust badges */}
                <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Secure Payment</p>
                      <p className="text-xs text-slate-500">
                        Your payment is protected by Stripe's secure checkout
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Pay After Approval</p>
                      <p className="text-xs text-slate-500">
                        Your card won't be charged until the host approves your booking
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {checkout.error && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                    <p className="text-sm text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {checkout.error}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              {checkout.fees && (
                <div>
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-xl font-bold text-slate-900">
                    {formatCurrency(checkout.fees.totalRenterPays)}
                  </p>
                </div>
              )}
              
              {step < 3 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={step === 1 && !checkout.startDate}
                  className="flex-1 max-w-xs ml-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={checkout.isLoading || !checkout.canCheckout}
                  className="flex-1 max-w-xs ml-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkout.isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Proceed to Payment
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingCheckoutModal;
