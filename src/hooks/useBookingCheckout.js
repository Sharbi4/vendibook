import { useState, useCallback, useMemo } from 'react';
import { calculateRentalFees, calculateRentalPrice, calculateUpsellTotal } from '../lib/utils/feeCalculator';
import { DELIVERY_OPTIONS } from '../lib/utils/deliveryCalculator';

/**
 * Hook to manage booking checkout state and Stripe integration
 * 
 * Handles:
 * - Date/time selection
 * - Delivery vs pickup
 * - Upsell selection
 * - Fee calculation (13% renter fee, delivery, upsells)
 * - Stripe checkout session creation
 * 
 * @param {Object} listing - Listing data with pricing and delivery settings
 * @param {Object} options - Optional configuration
 */
export function useBookingCheckout(listing, options = {}) {
  const { onSuccess, onError } = options;

  // Booking details state
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [pickupTime, setPickupTime] = useState('08:00');
  const [returnTime, setReturnTime] = useState('18:00');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [bookingMode, setBookingMode] = useState('daily');
  
  // Delivery state
  const [isPickup, setIsPickup] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  
  // Upsells state
  const [selectedUpsells, setSelectedUpsells] = useState([]);
  
  // Checkout state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);

  // Calculate rental days
  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    if (bookingMode === 'hourly') return 1;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
    
    const diff = end.getTime() - start.getTime();
    return Math.max(Math.floor(diff / 86400000) + 1, 1);
  }, [startDate, endDate, bookingMode]);

  // Calculate hours for hourly mode
  const rentalHours = useMemo(() => {
    if (bookingMode !== 'hourly' || !eventStartTime || !eventEndTime) return 0;
    
    const [startH, startM] = eventStartTime.split(':').map(Number);
    const [endH, endM] = eventEndTime.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    
    return Math.max((endMinutes - startMinutes) / 60, 0);
  }, [bookingMode, eventStartTime, eventEndTime]);

  // Calculate rental price
  const rentalPrice = useMemo(() => {
    if (!listing?.price) return null;
    
    const dailyRate = Number(listing.price) || 0;
    const hourlyRate = Number(listing.hourlyRate || listing.hourly_rate) || dailyRate / 8;
    
    if (bookingMode === 'hourly') {
      return {
        basePrice: Math.round(hourlyRate * rentalHours * 100) / 100,
        rentalHours,
        pricingType: 'hourly',
        hourlyRate
      };
    }
    
    return calculateRentalPrice({
      dailyRate,
      weeklyRate: listing.weeklyRate || listing.weekly_rate || null,
      monthlyRate: listing.monthlyRate || listing.monthly_rate || null,
      rentalDays: Math.max(1, rentalDays)
    });
  }, [listing, rentalDays, rentalHours, bookingMode]);

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

  // Calculate upsell total
  const upsellTotal = useMemo(() => {
    return calculateUpsellTotal(selectedUpsells);
  }, [selectedUpsells]);

  // Calculate full fee breakdown
  const fees = useMemo(() => {
    if (!rentalPrice) return null;
    
    return calculateRentalFees({
      basePrice: rentalPrice.basePrice,
      deliveryFee,
      upsellTotal
    });
  }, [rentalPrice, deliveryFee, upsellTotal]);

  // Check if booking can proceed
  const canCheckout = useMemo(() => {
    if (!listing?.id) return false;
    if (!startDate) return false;
    if (bookingMode === 'hourly' && (!eventStartTime || !eventEndTime)) return false;
    if (bookingMode !== 'hourly' && !endDate) return false;
    if (!fees || fees.totalRenterPays <= 0) return false;
    
    // Check delivery constraints
    if (!isPickup && deliveryInfo?.deliveryOption === DELIVERY_OPTIONS.OUT_OF_RANGE) {
      return false;
    }
    
    return true;
  }, [listing, startDate, endDate, bookingMode, eventStartTime, eventEndTime, fees, isPickup, deliveryInfo]);

  // Toggle upsell selection
  const toggleUpsell = useCallback((upsell) => {
    setSelectedUpsells(prev => {
      const exists = prev.find(u => u.id === upsell.id);
      if (exists) {
        return prev.filter(u => u.id !== upsell.id);
      }
      return [...prev, upsell];
    });
  }, []);

  // Clear all upsells
  const clearUpsells = useCallback(() => {
    setSelectedUpsells([]);
  }, []);

  // Build checkout metadata
  const buildCheckoutMetadata = useCallback(() => {
    const metadata = {
      listingId: listing?.id,
      listingTitle: listing?.title || 'Vendibook Rental',
      bookingMode,
      startDate: startDate || '',
      endDate: endDate || startDate || '',
      rentalDays: String(rentalDays),
      isPickup: String(isPickup),
      deliveryFee: String(deliveryFee),
      basePrice: String(rentalPrice?.basePrice || 0),
      serviceFee: String(fees?.renterServiceFee || 0),
      totalAmount: String(fees?.totalRenterPays || 0),
    };

    if (bookingMode === 'hourly') {
      metadata.eventStartTime = eventStartTime;
      metadata.eventEndTime = eventEndTime;
      metadata.rentalHours = String(rentalHours);
    } else if (bookingMode === 'daily-with-time') {
      metadata.pickupTime = pickupTime;
      metadata.returnTime = returnTime;
    }

    if (!isPickup && deliveryAddress) {
      metadata.deliveryAddress = deliveryAddress;
    }

    if (selectedUpsells.length > 0) {
      metadata.upsellCount = String(selectedUpsells.length);
      metadata.upsellTotal = String(upsellTotal);
      metadata.upsellIds = selectedUpsells.map(u => u.id).join(',');
    }

    return metadata;
  }, [
    listing, bookingMode, startDate, endDate, rentalDays,
    isPickup, deliveryAddress, deliveryFee, rentalPrice, fees,
    eventStartTime, eventEndTime, rentalHours,
    pickupTime, returnTime, selectedUpsells, upsellTotal
  ]);

  // Create Stripe checkout session
  const createCheckoutSession = useCallback(async (customerEmail = null) => {
    if (!canCheckout) {
      setError('Please complete all required fields');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const metadata = buildCheckoutMetadata();
      
      const response = await fetch('/api/stripe/createCheckout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          bookingType: `rental-${bookingMode}`,
          price: fees.totalRenterPays,
          startDate,
          endDate: endDate || startDate,
          customerEmail,
          metadata: {
            ...metadata,
            description: `${listing?.title || 'Rental'} - ${rentalDays} day${rentalDays !== 1 ? 's' : ''}`
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to create checkout session');
      }

      setCheckoutUrl(data.url);
      
      if (onSuccess) {
        onSuccess(data);
      }

      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to create checkout session';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [canCheckout, buildCheckoutMetadata, listing, fees, startDate, endDate, bookingMode, rentalDays, onSuccess, onError]);

  // Redirect to Stripe checkout
  const redirectToCheckout = useCallback(async (customerEmail = null) => {
    const result = await createCheckoutSession(customerEmail);
    
    if (result?.url) {
      window.location.href = result.url;
    }
    
    return result;
  }, [createCheckoutSession]);

  // Reset all checkout state
  const resetCheckout = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    setPickupTime('08:00');
    setReturnTime('18:00');
    setEventStartTime('');
    setEventEndTime('');
    setBookingMode('daily');
    setIsPickup(false);
    setDeliveryAddress('');
    setDeliveryInfo(null);
    setSelectedUpsells([]);
    setIsLoading(false);
    setError(null);
    setCheckoutUrl(null);
  }, []);

  return {
    // Dates & times
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    pickupTime,
    setPickupTime,
    returnTime,
    setReturnTime,
    eventStartTime,
    setEventStartTime,
    eventEndTime,
    setEventEndTime,
    bookingMode,
    setBookingMode,
    rentalDays,
    rentalHours,

    // Delivery
    isPickup,
    setIsPickup,
    deliveryAddress,
    setDeliveryAddress,
    deliveryInfo,
    setDeliveryInfo,
    deliveryFee,

    // Upsells
    selectedUpsells,
    setSelectedUpsells,
    toggleUpsell,
    clearUpsells,
    upsellTotal,

    // Pricing
    rentalPrice,
    fees,
    canCheckout,

    // Checkout actions
    isLoading,
    error,
    setError,
    checkoutUrl,
    createCheckoutSession,
    redirectToCheckout,
    resetCheckout,
    buildCheckoutMetadata,
  };
}

export default useBookingCheckout;
