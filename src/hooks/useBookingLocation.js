import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { shouldMaskAddress, BOOKING_STATES } from '../lib/stateMachines/bookingStateMachine';

/**
 * Hook to handle booking location reveal with address masking enforcement
 * 
 * Vendibook Core Trust Rule:
 * - Address is MASKED until booking state reaches 'Paid'
 * - Only renter, host, or admin can reveal address
 * - All reveals are audit-logged on the server
 * 
 * @returns {Object} Location reveal utilities
 */
export function useBookingLocation() {
  const { token } = useAuth();
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Check if address should be masked for a booking
   * @param {Object} booking - Booking object with state/status
   * @returns {boolean} True if address should be masked
   */
  const isAddressMasked = useCallback((booking) => {
    if (!booking) return true;
    
    // Use 'state' (new schema) or 'status' (legacy) field
    const bookingState = booking.state || booking.status;
    
    if (!bookingState) return true;
    
    // Map legacy status values to new state values for consistency
    const normalizedState = normalizeBookingState(bookingState);
    
    return shouldMaskAddress(normalizedState);
  }, []);

  /**
   * Get display location text (always safe to show)
   * @param {Object} booking - Booking with listing data
   * @returns {string} Safe display location
   */
  const getDisplayLocation = useCallback((booking) => {
    if (!booking?.listing) return 'Location revealed after payment';
    
    const { listing } = booking;
    const displayLocation = listing.displayLocation || listing.display_location;
    
    if (displayLocation) return displayLocation;
    
    // Fall back to city/state (public info)
    const city = listing.city || listing.display_city || listing.displayCity;
    const state = listing.state || listing.display_state || listing.displayState;
    
    if (city && state) return `${city}, ${state}`;
    if (city || state) return city || state;
    
    return 'Location revealed after payment';
  }, []);

  /**
   * Get masked or revealed address based on booking state
   * @param {Object} booking - Booking object
   * @returns {Object} Address info with masking status
   */
  const getAddressInfo = useCallback((booking) => {
    if (!booking?.listing) {
      return {
        isMasked: true,
        displayText: 'Location revealed after payment',
        preciseAddress: null,
        canReveal: false,
        reason: 'No booking data'
      };
    }

    const isMasked = isAddressMasked(booking);
    const displayLocation = getDisplayLocation(booking);
    const bookingState = booking.state || booking.status;

    if (isMasked) {
      return {
        isMasked: true,
        displayText: displayLocation,
        preciseAddress: null,
        canReveal: false,
        reason: getAddressMaskReason(bookingState),
        bookingState: bookingState
      };
    }

    // Address can be revealed - check if we already have it
    const preciseAddress = 
      booking.listing.preciseAddress || 
      booking.listing.precise_address ||
      booking.revealedAddress ||
      location?.preciseAddress;

    return {
      isMasked: false,
      displayText: preciseAddress || displayLocation,
      preciseAddress: preciseAddress,
      canReveal: true,
      needsFetch: !preciseAddress,
      bookingState: bookingState
    };
  }, [isAddressMasked, getDisplayLocation, location]);

  /**
   * Fetch precise address from server (requires auth)
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Location data
   */
  const revealAddress = useCallback(async (bookingId) => {
    if (!bookingId) {
      setError('Booking ID is required');
      return null;
    }

    if (!token) {
      setError('Please sign in to view the address');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/location`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 400 && data.error === 'PAYMENT_NOT_CONFIRMED') {
          setError('Complete payment to see the exact address');
          return null;
        }
        if (response.status === 403) {
          setError('You do not have access to this booking location');
          return null;
        }
        throw new Error(data.message || 'Failed to load address');
      }

      const locationData = data.data;
      setLocation(locationData);
      return locationData;
    } catch (err) {
      setError(err.message || 'Failed to load address');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  /**
   * Clear cached location data
   */
  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  return {
    // State
    location,
    isLoading,
    error,
    
    // Methods
    isAddressMasked,
    getDisplayLocation,
    getAddressInfo,
    revealAddress,
    clearLocation
  };
}

/**
 * Normalize booking state to match state machine values
 */
function normalizeBookingState(state) {
  if (!state) return BOOKING_STATES.REQUESTED;
  
  const stateMap = {
    // New state values (PascalCase)
    'Requested': BOOKING_STATES.REQUESTED,
    'HostApproved': BOOKING_STATES.HOST_APPROVED,
    'Paid': BOOKING_STATES.PAID,
    'InProgress': BOOKING_STATES.IN_PROGRESS,
    'ReturnedPendingConfirmation': BOOKING_STATES.RETURNED_PENDING_CONFIRMATION,
    'Completed': BOOKING_STATES.COMPLETED,
    'Canceled': BOOKING_STATES.CANCELED,
    
    // Legacy status values (UPPERCASE)
    'PENDING': BOOKING_STATES.REQUESTED,
    'APPROVED': BOOKING_STATES.HOST_APPROVED, // Note: APPROVED = HostApproved, not Paid
    'PAID': BOOKING_STATES.PAID,
    'IN_PROGRESS': BOOKING_STATES.IN_PROGRESS,
    'RETURNED_PENDING_CONFIRMATION': BOOKING_STATES.RETURNED_PENDING_CONFIRMATION,
    'COMPLETED': BOOKING_STATES.COMPLETED,
    'CANCELLED': BOOKING_STATES.CANCELED,
    'CANCELED': BOOKING_STATES.CANCELED,
    'DECLINED': BOOKING_STATES.CANCELED
  };
  
  return stateMap[state] || BOOKING_STATES.REQUESTED;
}

/**
 * Get human-readable reason why address is masked
 */
function getAddressMaskReason(state) {
  const normalizedState = normalizeBookingState(state);
  
  switch (normalizedState) {
    case BOOKING_STATES.REQUESTED:
      return 'Waiting for host approval';
    case BOOKING_STATES.HOST_APPROVED:
      return 'Complete payment to see exact address';
    case BOOKING_STATES.CANCELED:
      return 'Booking was cancelled';
    default:
      return 'Address not available';
  }
}

export default useBookingLocation;
