import { useCallback, useRef, useEffect } from 'react';
import { useAuth } from './useAuth';

/**
 * Analytics event types
 */
export const ANALYTICS_EVENTS = {
  // Listing events
  LISTING_VIEW: 'listing_view',
  LISTING_SAVE: 'listing_save',
  LISTING_UNSAVE: 'listing_unsave',
  LISTING_SHARE: 'listing_share',
  LISTING_CONTACT: 'listing_contact',
  
  // Booking events
  BOOKING_STARTED: 'booking_started',
  BOOKING_DATES_SELECTED: 'booking_dates_selected',
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELED: 'booking_canceled',
  
  // Search events
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  SEARCH_RESULT_CLICKED: 'search_result_clicked',
  
  // User events
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  LOGIN: 'login',
  HOST_ONBOARDING_STARTED: 'host_onboarding_started',
  HOST_ONBOARDING_COMPLETED: 'host_onboarding_completed',
  
  // Page views
  PAGE_VIEW: 'page_view'
};

/**
 * Generate or retrieve session ID
 */
function getSessionId() {
  if (typeof window === 'undefined') return null;
  
  let sessionId = sessionStorage.getItem('vb_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem('vb_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Analytics tracking hook
 * 
 * @example
 * const { track, trackPageView, trackListingView } = useAnalytics();
 * 
 * // Track custom event
 * track(ANALYTICS_EVENTS.SEARCH_PERFORMED, { query: 'food truck', filters: {...} });
 * 
 * // Track listing view
 * trackListingView(listingId);
 */
export function useAnalytics() {
  const { user } = useAuth();
  const sessionId = useRef(getSessionId());

  /**
   * Core tracking function
   */
  const track = useCallback(async (eventType, properties = {}) => {
    try {
      const payload = {
        event: eventType,
        userId: user?.id || null,
        sessionId: sessionId.current,
        properties: {
          ...properties,
          timestamp: new Date().toISOString()
        },
        url: typeof window !== 'undefined' ? window.location.href : null,
        referrer: typeof document !== 'undefined' ? document.referrer : null
      };

      // Fire and forget - don't await
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {
        // Silently fail - analytics shouldn't break the app
      });

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', eventType, properties);
      }
    } catch (error) {
      // Silently fail
      console.warn('[Analytics] Failed to track:', error);
    }
  }, [user?.id]);

  /**
   * Track page view
   */
  const trackPageView = useCallback((pageName, properties = {}) => {
    track(ANALYTICS_EVENTS.PAGE_VIEW, {
      page: pageName,
      path: typeof window !== 'undefined' ? window.location.pathname : null,
      ...properties
    });
  }, [track]);

  /**
   * Track listing view
   */
  const trackListingView = useCallback((listingId, listingData = {}) => {
    track(ANALYTICS_EVENTS.LISTING_VIEW, {
      listingId,
      listingType: listingData.listingType || listingData.listing_type,
      price: listingData.price,
      city: listingData.city
    });
  }, [track]);

  /**
   * Track search
   */
  const trackSearch = useCallback((query, filters = {}, resultCount = 0) => {
    track(ANALYTICS_EVENTS.SEARCH_PERFORMED, {
      query,
      filters,
      resultCount
    });
  }, [track]);

  /**
   * Track booking started
   */
  const trackBookingStarted = useCallback((listingId, bookingData = {}) => {
    track(ANALYTICS_EVENTS.BOOKING_STARTED, {
      listingId,
      ...bookingData
    });
  }, [track]);

  /**
   * Track checkout started
   */
  const trackCheckoutStarted = useCallback((listingId, totalAmount, bookingData = {}) => {
    track(ANALYTICS_EVENTS.CHECKOUT_STARTED, {
      listingId,
      totalAmount,
      ...bookingData
    });
  }, [track]);

  /**
   * Track checkout completed
   */
  const trackCheckoutCompleted = useCallback((listingId, bookingId, totalAmount) => {
    track(ANALYTICS_EVENTS.CHECKOUT_COMPLETED, {
      listingId,
      bookingId,
      totalAmount
    });
  }, [track]);

  return {
    track,
    trackPageView,
    trackListingView,
    trackSearch,
    trackBookingStarted,
    trackCheckoutStarted,
    trackCheckoutCompleted,
    sessionId: sessionId.current,
    EVENTS: ANALYTICS_EVENTS
  };
}

/**
 * Hook to auto-track page views
 */
export function usePageTracking(pageName) {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    if (pageName) {
      trackPageView(pageName);
    }
  }, [pageName, trackPageView]);
}

export default useAnalytics;
