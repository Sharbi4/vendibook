import { useMemo, useCallback } from 'react';
import { shouldLockCalendar, BOOKING_STATES } from '../lib/stateMachines/bookingStateMachine';

/**
 * Hook to enforce calendar locking based on booking state
 * 
 * Vendibook Calendar Rules:
 * - Dates are AVAILABLE until booking reaches Paid state
 * - Dates LOCK when state = Paid, InProgress, ReturnedPendingConfirmation
 * - Dates UNLOCK if booking is Canceled before payment
 * - Once Completed, dates can be rebooked
 * 
 * @param {Array} bookings - Array of booking objects for a listing
 * @returns {Object} Calendar locking utilities
 */
export function useCalendarLock(bookings = []) {
  
  /**
   * Get all locked date ranges from bookings
   * Only bookings in Paid, InProgress, or ReturnedPendingConfirmation lock dates
   */
  const lockedDateRanges = useMemo(() => {
    return bookings
      .filter(booking => {
        const state = normalizeState(booking.state || booking.status);
        return shouldLockCalendar(state);
      })
      .map(booking => ({
        bookingId: booking.id,
        startDate: new Date(booking.startDate || booking.start_date),
        endDate: new Date(booking.endDate || booking.end_date),
        state: booking.state || booking.status,
        renterName: booking.renter?.displayName || booking.renter?.email || 'Guest'
      }))
      .filter(range => 
        !isNaN(range.startDate.getTime()) && 
        !isNaN(range.endDate.getTime())
      );
  }, [bookings]);

  /**
   * Get all dates that are locked (for calendar display)
   */
  const lockedDates = useMemo(() => {
    const dates = new Set();
    
    lockedDateRanges.forEach(range => {
      let current = new Date(range.startDate);
      const end = new Date(range.endDate);
      
      while (current <= end) {
        dates.add(formatDateKey(current));
        current.setDate(current.getDate() + 1);
      }
    });
    
    return dates;
  }, [lockedDateRanges]);

  /**
   * Check if a specific date is locked
   */
  const isDateLocked = useCallback((date) => {
    const dateKey = formatDateKey(new Date(date));
    return lockedDates.has(dateKey);
  }, [lockedDates]);

  /**
   * Check if a date range conflicts with any locked dates
   */
  const hasConflict = useCallback((startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return false;
    }

    let current = new Date(start);
    while (current <= end) {
      if (isDateLocked(current)) {
        return true;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return false;
  }, [isDateLocked]);

  /**
   * Get conflicting bookings for a date range
   */
  const getConflictingBookings = useCallback((startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return [];
    }

    return lockedDateRanges.filter(range => {
      // Check if ranges overlap
      return start <= range.endDate && end >= range.startDate;
    });
  }, [lockedDateRanges]);

  /**
   * Check if booking would lock these dates (for preview before payment)
   */
  const wouldLockDates = useCallback((booking) => {
    const state = normalizeState(booking.state || booking.status);
    
    // Only Paid and later states lock dates
    return state === BOOKING_STATES.PAID ||
           state === BOOKING_STATES.IN_PROGRESS ||
           state === BOOKING_STATES.RETURNED_PENDING_CONFIRMATION;
  }, []);

  /**
   * Get calendar state for display
   */
  const getDateState = useCallback((date) => {
    const dateKey = formatDateKey(new Date(date));
    
    if (!lockedDates.has(dateKey)) {
      return {
        available: true,
        state: 'available',
        label: 'Available'
      };
    }

    // Find which booking has this date locked
    const matchingRange = lockedDateRanges.find(range => {
      const current = new Date(date);
      return current >= range.startDate && current <= range.endDate;
    });

    if (matchingRange) {
      const state = normalizeState(matchingRange.state);
      return {
        available: false,
        state: state.toLowerCase(),
        label: getStateLockLabel(state),
        bookingId: matchingRange.bookingId
      };
    }

    return {
      available: false,
      state: 'unavailable',
      label: 'Unavailable'
    };
  }, [lockedDates, lockedDateRanges]);

  return {
    // Data
    lockedDateRanges,
    lockedDates,
    
    // Methods
    isDateLocked,
    hasConflict,
    getConflictingBookings,
    wouldLockDates,
    getDateState
  };
}

/**
 * Normalize state to match state machine values
 */
function normalizeState(state) {
  if (!state) return BOOKING_STATES.REQUESTED;
  
  const stateMap = {
    'Requested': BOOKING_STATES.REQUESTED,
    'HostApproved': BOOKING_STATES.HOST_APPROVED,
    'Paid': BOOKING_STATES.PAID,
    'InProgress': BOOKING_STATES.IN_PROGRESS,
    'ReturnedPendingConfirmation': BOOKING_STATES.RETURNED_PENDING_CONFIRMATION,
    'Completed': BOOKING_STATES.COMPLETED,
    'Canceled': BOOKING_STATES.CANCELED,
    'PENDING': BOOKING_STATES.REQUESTED,
    'APPROVED': BOOKING_STATES.HOST_APPROVED,
    'PAID': BOOKING_STATES.PAID,
    'IN_PROGRESS': BOOKING_STATES.IN_PROGRESS,
    'COMPLETED': BOOKING_STATES.COMPLETED,
    'CANCELLED': BOOKING_STATES.CANCELED,
    'CANCELED': BOOKING_STATES.CANCELED
  };
  
  return stateMap[state] || BOOKING_STATES.REQUESTED;
}

/**
 * Format date to YYYY-MM-DD for set comparison
 */
function formatDateKey(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Get human-readable label for why date is locked
 */
function getStateLockLabel(state) {
  switch (state) {
    case BOOKING_STATES.PAID:
      return 'Booked';
    case BOOKING_STATES.IN_PROGRESS:
      return 'In use';
    case BOOKING_STATES.RETURNED_PENDING_CONFIRMATION:
      return 'Pending return';
    default:
      return 'Unavailable';
  }
}

export default useCalendarLock;
