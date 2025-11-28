import { useCallback, useMemo } from 'react';
import { canSendMessages as bookingCanSendMessages, BOOKING_STATES } from '../lib/stateMachines/bookingStateMachine';
import { canSendMessages as salesCanSendMessages, SALES_STATES } from '../lib/stateMachines/salesStateMachine';

/**
 * Hook to enforce messaging rules based on booking/sale state
 * 
 * Vendibook Messaging Rules:
 * - Messaging is ENABLED in: Requested, HostApproved, Paid, InProgress, ReturnedPendingConfirmation
 * - Messaging is DISABLED in: Completed, Canceled
 * - Once a booking reaches Completed or Canceled, messaging thread is locked
 * 
 * @returns {Object} Messaging permission utilities
 */
export function useMessagingPermissions() {
  /**
   * Check if messaging is allowed for a booking
   * @param {Object} booking - Booking object with state/status
   * @returns {Object} Messaging permission info
   */
  const canMessageForBooking = useCallback((booking) => {
    if (!booking) {
      return {
        allowed: false,
        reason: 'No booking context',
        bookingState: null
      };
    }

    // Use 'state' (new schema) or 'status' (legacy)
    const bookingState = normalizeBookingState(booking.state || booking.status);
    const allowed = bookingCanSendMessages(bookingState);

    return {
      allowed,
      reason: allowed 
        ? 'Messaging is available for this booking' 
        : getMessagingDisabledReason(bookingState),
      bookingState
    };
  }, []);

  /**
   * Check if messaging is allowed for a sale
   * @param {Object} sale - Sale object with state/status
   * @returns {Object} Messaging permission info
   */
  const canMessageForSale = useCallback((sale) => {
    if (!sale) {
      return {
        allowed: false,
        reason: 'No sale context',
        saleState: null
      };
    }

    const saleState = normalizeSaleState(sale.state || sale.status);
    const allowed = salesCanSendMessages(saleState);

    return {
      allowed,
      reason: allowed 
        ? 'Messaging is available for this sale' 
        : getSaleMessagingDisabledReason(saleState),
      saleState
    };
  }, []);

  /**
   * Get messaging status for a thread with booking/sale context
   * @param {Object} thread - Message thread with booking/sale reference
   * @returns {Object} Messaging permission info
   */
  const getThreadMessagingStatus = useCallback((thread) => {
    if (!thread) {
      return {
        allowed: true, // General threads without booking context are always allowed
        reason: 'General inquiry thread',
        context: null
      };
    }

    // Check if thread is associated with a booking
    if (thread.booking || thread.bookingId) {
      const booking = thread.booking || { state: thread.bookingState, status: thread.bookingStatus };
      const result = canMessageForBooking(booking);
      return {
        ...result,
        context: 'booking',
        contextId: thread.bookingId || booking?.id
      };
    }

    // Check if thread is associated with a sale
    if (thread.sale || thread.saleId) {
      const sale = thread.sale || { state: thread.saleState, status: thread.saleStatus };
      const result = canMessageForSale(sale);
      return {
        ...result,
        context: 'sale',
        contextId: thread.saleId || sale?.id
      };
    }

    // General inquiry threads without transaction context
    return {
      allowed: true,
      reason: 'General inquiry thread',
      context: 'inquiry'
    };
  }, [canMessageForBooking, canMessageForSale]);

  return {
    canMessageForBooking,
    canMessageForSale,
    getThreadMessagingStatus
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
    'APPROVED': BOOKING_STATES.HOST_APPROVED,
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
 * Normalize sale state to match state machine values
 */
function normalizeSaleState(state) {
  if (!state) return SALES_STATES?.LISTED || 'Listed';
  
  const stateMap = {
    // New state values
    'Listed': SALES_STATES?.LISTED || 'Listed',
    'UnderOffer': SALES_STATES?.UNDER_OFFER || 'UnderOffer',
    'OfferAccepted': SALES_STATES?.OFFER_ACCEPTED || 'OfferAccepted',
    'PaymentPending': SALES_STATES?.PAYMENT_PENDING || 'PaymentPending',
    'Paid': SALES_STATES?.PAID || 'Paid',
    'InTransfer': SALES_STATES?.IN_TRANSFER || 'InTransfer',
    'Completed': SALES_STATES?.COMPLETED || 'Completed',
    'Canceled': SALES_STATES?.CANCELED || 'Canceled',
    
    // Legacy values
    'LISTED': 'Listed',
    'PENDING': 'Listed',
    'UNDER_OFFER': 'UnderOffer',
    'OFFER_ACCEPTED': 'OfferAccepted',
    'ACCEPTED': 'OfferAccepted',
    'PAYMENT_PENDING': 'PaymentPending',
    'PAID': 'Paid',
    'IN_TRANSFER': 'InTransfer',
    'SHIPPED': 'InTransfer',
    'DELIVERED': 'InTransfer',
    'COMPLETED': 'Completed',
    'CANCELLED': 'Canceled',
    'CANCELED': 'Canceled'
  };
  
  return stateMap[state] || 'Listed';
}

/**
 * Get reason why messaging is disabled for booking
 */
function getMessagingDisabledReason(state) {
  switch (state) {
    case BOOKING_STATES.COMPLETED:
      return 'This booking is complete. Messaging is no longer available.';
    case BOOKING_STATES.CANCELED:
      return 'This booking was cancelled. Messaging is no longer available.';
    default:
      return 'Messaging is not available for this booking status.';
  }
}

/**
 * Get reason why messaging is disabled for sale
 */
function getSaleMessagingDisabledReason(state) {
  const completed = SALES_STATES?.COMPLETED || 'Completed';
  const canceled = SALES_STATES?.CANCELED || 'Canceled';
  
  if (state === completed) {
    return 'This sale is complete. Messaging is no longer available.';
  }
  if (state === canceled) {
    return 'This sale was cancelled. Messaging is no longer available.';
  }
  return 'Messaging is not available for this sale status.';
}

export default useMessagingPermissions;
