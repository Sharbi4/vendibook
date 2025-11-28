import { useState, useCallback, useMemo } from 'react';
import { 
  calculateDeliveryFromCoordinates, 
  DELIVERY_OPTIONS,
  canBookWithDeliveryOption 
} from '../lib/utils/deliveryCalculator';

/**
 * Hook to calculate delivery options based on renter address
 * 
 * Delivery Zones:
 * 1. Free Delivery: Within host's free delivery radius
 * 2. Paid Delivery: Within paid delivery radius (charged per mile)
 * 3. Pickup Required: Beyond paid delivery but within max distance
 * 4. Out of Range: Beyond max distance - cannot book
 * 
 * @param {Object} listing - Listing with delivery settings and coordinates
 * @returns {Object} Delivery calculation utilities
 */
export function useDeliveryCalculator(listing) {
  const [renterAddress, setRenterAddress] = useState('');
  const [renterCoordinates, setRenterCoordinates] = useState(null);
  const [isPickup, setIsPickup] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);

  // Extract listing coordinates
  const listingCoordinates = useMemo(() => {
    if (!listing) return null;
    
    // Try different coordinate formats
    const coords = listing.coordinates || listing.location;
    if (coords?.latitude && coords?.longitude) {
      return { latitude: coords.latitude, longitude: coords.longitude };
    }
    if (coords?.lat && coords?.lng) {
      return { latitude: coords.lat, longitude: coords.lng };
    }
    if (listing.latitude && listing.longitude) {
      return { latitude: listing.latitude, longitude: listing.longitude };
    }
    if (listing.lat && listing.lng) {
      return { latitude: listing.lat, longitude: listing.lng };
    }
    
    return null;
  }, [listing]);

  // Extract delivery settings from listing
  const deliverySettings = useMemo(() => {
    if (!listing) return null;
    
    return {
      freeDeliveryRadius: 
        listing.freeDeliveryRadius || 
        listing.free_delivery_radius || 
        listing.free_delivery_radius_miles || 
        0,
      paidDeliveryRadius: 
        listing.paidDeliveryRadius || 
        listing.paid_delivery_radius || 
        listing.paid_delivery_radius_miles || 
        0,
      deliveryPricePerMile: 
        listing.deliveryPricePerMile || 
        listing.delivery_price_per_mile || 
        listing.per_mile_charge ||
        0,
      maxDeliveryDistance: 
        listing.maxDeliveryDistance || 
        listing.max_delivery_distance || 
        listing.max_delivery_distance_miles ||
        0,
      pickupRequired: 
        listing.pickupRequired || 
        listing.pickup_required || 
        listing.pickup_only ||
        false,
    };
  }, [listing]);

  // Calculate delivery info when we have both coordinates
  const deliveryInfo = useMemo(() => {
    if (!listingCoordinates || !renterCoordinates || !deliverySettings) {
      return null;
    }

    return calculateDeliveryFromCoordinates({
      listingLocation: listingCoordinates,
      deliveryLocation: renterCoordinates,
      deliverySettings
    });
  }, [listingCoordinates, renterCoordinates, deliverySettings]);

  // Check if booking is possible
  const canBook = useMemo(() => {
    if (!deliveryInfo) return true; // No delivery info yet, allow to proceed
    return canBookWithDeliveryOption(deliveryInfo.deliveryOption);
  }, [deliveryInfo]);

  // Get delivery fee for checkout
  const deliveryFee = useMemo(() => {
    if (isPickup) return 0;
    if (!deliveryInfo) return 0;
    if (deliveryInfo.deliveryOption === DELIVERY_OPTIONS.FREE_DELIVERY) return 0;
    if (deliveryInfo.deliveryOption === DELIVERY_OPTIONS.PAID_DELIVERY) {
      return deliveryInfo.deliveryFee || 0;
    }
    return 0;
  }, [deliveryInfo, isPickup]);

  /**
   * Geocode an address to coordinates
   * Uses Mapbox geocoding API
   */
  const geocodeAddress = useCallback(async (address) => {
    if (!address || address.length < 5) {
      setError('Please enter a valid address');
      return null;
    }

    setIsCalculating(true);
    setError(null);

    try {
      // Use Mapbox geocoding API
      const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      
      if (!mapboxToken) {
        // Fallback: try to use our API
        const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
        const data = await response.json();
        
        if (!response.ok || !data.coordinates) {
          throw new Error('Unable to find this address');
        }
        
        return data.coordinates;
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}&country=us&limit=1`
      );
      
      const data = await response.json();
      
      if (!data.features || data.features.length === 0) {
        throw new Error('Unable to find this address');
      }

      const [lng, lat] = data.features[0].center;
      return { latitude: lat, longitude: lng };
    } catch (err) {
      setError(err.message || 'Unable to geocode address');
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  /**
   * Calculate delivery based on entered address
   */
  const calculateDelivery = useCallback(async (address) => {
    setRenterAddress(address);
    
    const coords = await geocodeAddress(address);
    if (coords) {
      setRenterCoordinates(coords);
      setIsPickup(false); // Default to delivery when address is entered
    }
    
    return coords;
  }, [geocodeAddress]);

  /**
   * Select pickup option
   */
  const selectPickup = useCallback(() => {
    setIsPickup(true);
    setError(null);
  }, []);

  /**
   * Select delivery option
   */
  const selectDelivery = useCallback(() => {
    setIsPickup(false);
    setError(null);
  }, []);

  /**
   * Reset delivery selection
   */
  const resetDelivery = useCallback(() => {
    setRenterAddress('');
    setRenterCoordinates(null);
    setIsPickup(false);
    setError(null);
  }, []);

  /**
   * Get human-readable delivery status
   */
  const getDeliveryStatus = useCallback(() => {
    if (isPickup) {
      return {
        type: 'pickup',
        label: 'Pickup',
        description: 'You will pick up from host location',
        fee: 0
      };
    }

    if (!deliveryInfo) {
      return {
        type: 'pending',
        label: 'Enter address',
        description: 'Enter your address to see delivery options',
        fee: 0
      };
    }

    switch (deliveryInfo.deliveryOption) {
      case DELIVERY_OPTIONS.FREE_DELIVERY:
        return {
          type: 'free',
          label: 'Free Delivery',
          description: `Free delivery within ${deliverySettings?.freeDeliveryRadius} miles`,
          fee: 0
        };
      case DELIVERY_OPTIONS.PAID_DELIVERY:
        return {
          type: 'paid',
          label: 'Delivery Available',
          description: `${deliveryInfo.deliveryDistance?.toFixed(1)} miles away`,
          fee: deliveryInfo.deliveryFee
        };
      case DELIVERY_OPTIONS.PICKUP_REQUIRED:
        return {
          type: 'pickup_only',
          label: 'Pickup Required',
          description: deliveryInfo.message,
          fee: 0
        };
      case DELIVERY_OPTIONS.OUT_OF_RANGE:
        return {
          type: 'out_of_range',
          label: 'Out of Range',
          description: deliveryInfo.message,
          fee: 0,
          canBook: false
        };
      default:
        return {
          type: 'unknown',
          label: 'Unknown',
          description: '',
          fee: 0
        };
    }
  }, [deliveryInfo, deliverySettings, isPickup]);

  return {
    // State
    renterAddress,
    renterCoordinates,
    isPickup,
    isCalculating,
    error,
    deliveryInfo,
    deliveryFee,
    canBook,
    deliverySettings,
    listingCoordinates,
    
    // Methods
    calculateDelivery,
    selectPickup,
    selectDelivery,
    resetDelivery,
    getDeliveryStatus,
    setRenterCoordinates,
    setRenterAddress
  };
}

export default useDeliveryCalculator;
