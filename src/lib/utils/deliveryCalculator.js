/**
 * Delivery Logic Calculator for Vendibook
 *
 * Delivery Zones:
 * 1. Free Delivery: Within host's free_delivery_radius_miles
 * 2. Paid Delivery: Within paid_delivery_radius_miles (charged per mile)
 * 3. Pickup Required: Beyond paid delivery radius but within max_delivery_distance_miles
 * 4. Out of Range: Beyond max_delivery_distance_miles
 */

export const DELIVERY_OPTIONS = {
  FREE_DELIVERY: 'free_delivery',
  PAID_DELIVERY: 'paid_delivery',
  PICKUP_REQUIRED: 'pickup_required',
  OUT_OF_RANGE: 'out_of_range',
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Object} from - Starting coordinates {latitude, longitude}
 * @param {Object} to - Ending coordinates {latitude, longitude}
 * @returns {number} - Distance in miles
 */
export function calculateDistance(from, to) {
  const R = 3958.8; // Earth's radius in miles

  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} - Radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Determine delivery option and calculate delivery fee
 * @param {Object} params - Delivery parameters
 * @param {number} params.distance - Distance in miles
 * @param {number} params.freeDeliveryRadius - Free delivery radius in miles
 * @param {number} params.paidDeliveryRadius - Paid delivery radius in miles
 * @param {number} params.deliveryPricePerMile - Price per mile for paid delivery
 * @param {number} params.maxDeliveryDistance - Maximum delivery distance in miles
 * @param {boolean} params.pickupRequired - Whether host requires pickup only
 * @returns {Object} - Delivery option and fee
 */
export function calculateDeliveryFee({
  distance,
  freeDeliveryRadius = 0,
  paidDeliveryRadius = 0,
  deliveryPricePerMile = 0,
  maxDeliveryDistance = 0,
  pickupRequired = false,
}) {
  // If host requires pickup only, no delivery available
  if (pickupRequired) {
    return {
      deliveryOption: DELIVERY_OPTIONS.PICKUP_REQUIRED,
      deliveryFee: 0,
      deliveryDistance: distance,
      message: 'Pickup required - Host does not offer delivery',
    };
  }

  // Check if within free delivery radius
  if (freeDeliveryRadius > 0 && distance <= freeDeliveryRadius) {
    return {
      deliveryOption: DELIVERY_OPTIONS.FREE_DELIVERY,
      deliveryFee: 0,
      deliveryDistance: distance,
      message: `Free delivery within ${freeDeliveryRadius} miles`,
    };
  }

  // Check if within paid delivery radius
  if (paidDeliveryRadius > 0 && distance <= paidDeliveryRadius) {
    const fee = Math.round(distance * deliveryPricePerMile * 100) / 100;
    return {
      deliveryOption: DELIVERY_OPTIONS.PAID_DELIVERY,
      deliveryFee: fee,
      deliveryDistance: distance,
      message: `Delivery available at $${deliveryPricePerMile}/mile`,
    };
  }

  // Check if within max delivery distance (but requires pickup)
  if (maxDeliveryDistance > 0 && distance <= maxDeliveryDistance) {
    return {
      deliveryOption: DELIVERY_OPTIONS.PICKUP_REQUIRED,
      deliveryFee: 0,
      deliveryDistance: distance,
      message: `Beyond delivery zone - Pickup required (${distance.toFixed(1)} miles away)`,
    };
  }

  // Out of range
  return {
    deliveryOption: DELIVERY_OPTIONS.OUT_OF_RANGE,
    deliveryFee: 0,
    deliveryDistance: distance,
    message: maxDeliveryDistance > 0
      ? `Out of range - Maximum distance is ${maxDeliveryDistance} miles`
      : 'Out of range - Pickup not available',
  };
}

/**
 * Calculate delivery details from coordinates
 * @param {Object} params - Parameters
 * @param {Object} params.listingLocation - {latitude, longitude} of listing
 * @param {Object} params.deliveryLocation - {latitude, longitude} of delivery address
 * @param {Object} params.deliverySettings - Host's delivery settings
 * @returns {Object} - Complete delivery calculation
 */
export function calculateDeliveryFromCoordinates({
  listingLocation,
  deliveryLocation,
  deliverySettings,
}) {
  const distance = calculateDistance(listingLocation, deliveryLocation);

  return calculateDeliveryFee({
    distance,
    freeDeliveryRadius: deliverySettings.freeDeliveryRadius || 0,
    paidDeliveryRadius: deliverySettings.paidDeliveryRadius || 0,
    deliveryPricePerMile: deliverySettings.deliveryPricePerMile || 0,
    maxDeliveryDistance: deliverySettings.maxDeliveryDistance || 0,
    pickupRequired: deliverySettings.pickupRequired || false,
  });
}

/**
 * Validate delivery settings when host creates/updates listing
 * @param {Object} settings - Delivery settings to validate
 * @returns {Object} - {valid: boolean, errors: string[]}
 */
export function validateDeliverySettings(settings) {
  const errors = [];

  if (settings.pickupRequired) {
    // If pickup required, no other settings needed
    return { valid: true, errors: [] };
  }

  if (settings.freeDeliveryRadius < 0) {
    errors.push('Free delivery radius cannot be negative');
  }

  if (settings.paidDeliveryRadius < 0) {
    errors.push('Paid delivery radius cannot be negative');
  }

  if (settings.deliveryPricePerMile < 0) {
    errors.push('Delivery price per mile cannot be negative');
  }

  if (settings.maxDeliveryDistance < 0) {
    errors.push('Maximum delivery distance cannot be negative');
  }

  // Paid delivery radius should be >= free delivery radius
  if (
    settings.paidDeliveryRadius > 0 &&
    settings.freeDeliveryRadius > 0 &&
    settings.paidDeliveryRadius < settings.freeDeliveryRadius
  ) {
    errors.push('Paid delivery radius must be greater than or equal to free delivery radius');
  }

  // Max distance should be >= paid delivery radius
  if (
    settings.maxDeliveryDistance > 0 &&
    settings.paidDeliveryRadius > 0 &&
    settings.maxDeliveryDistance < settings.paidDeliveryRadius
  ) {
    errors.push('Maximum delivery distance must be greater than or equal to paid delivery radius');
  }

  // If paid delivery is offered, must have price per mile
  if (settings.paidDeliveryRadius > 0 && settings.deliveryPricePerMile <= 0) {
    errors.push('Delivery price per mile must be set when offering paid delivery');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get recommended delivery settings based on equipment type
 * @param {string} category - Listing category
 * @returns {Object} - Recommended delivery settings
 */
export function getRecommendedDeliverySettings(category) {
  const recommendations = {
    food_truck: {
      freeDeliveryRadius: 10,
      paidDeliveryRadius: 50,
      deliveryPricePerMile: 3.5,
      maxDeliveryDistance: 100,
      pickupRequired: false,
      note: 'Food trucks typically offer wider delivery due to mobility',
    },
    food_trailer: {
      freeDeliveryRadius: 5,
      paidDeliveryRadius: 30,
      deliveryPricePerMile: 4.0,
      maxDeliveryDistance: 75,
      pickupRequired: false,
      note: 'Trailers require towing equipment for delivery',
    },
    ghost_kitchen: {
      freeDeliveryRadius: 0,
      paidDeliveryRadius: 0,
      deliveryPricePerMile: 0,
      maxDeliveryDistance: 10,
      pickupRequired: true,
      note: 'Ghost kitchens are typically stationary - pickup required',
    },
    stall: {
      freeDeliveryRadius: 15,
      paidDeliveryRadius: 40,
      deliveryPricePerMile: 2.5,
      maxDeliveryDistance: 80,
      pickupRequired: false,
      note: 'Stalls are lightweight and easy to transport',
    },
    vending_lot: {
      freeDeliveryRadius: 0,
      paidDeliveryRadius: 0,
      deliveryPricePerMile: 0,
      maxDeliveryDistance: 25,
      pickupRequired: true,
      note: 'Vending lots are location-based - renters come to you',
    },
    for_sale: {
      freeDeliveryRadius: 0,
      paidDeliveryRadius: 50,
      deliveryPricePerMile: 5.0,
      maxDeliveryDistance: 200,
      pickupRequired: false,
      note: 'For sales, buyers often arrange their own transport',
    },
  };

  return recommendations[category] || {
    freeDeliveryRadius: 5,
    paidDeliveryRadius: 25,
    deliveryPricePerMile: 3.0,
    maxDeliveryDistance: 50,
    pickupRequired: false,
    note: 'Default settings for general equipment',
  };
}

/**
 * Format delivery information for display
 * @param {Object} deliveryInfo - Result from calculateDeliveryFee
 * @returns {string} - Human-readable delivery info
 */
export function formatDeliveryInfo(deliveryInfo) {
  switch (deliveryInfo.deliveryOption) {
    case DELIVERY_OPTIONS.FREE_DELIVERY:
      return `Free delivery (${deliveryInfo.deliveryDistance} miles)`;
    case DELIVERY_OPTIONS.PAID_DELIVERY:
      return `$${deliveryInfo.deliveryFee.toFixed(2)} delivery fee (${deliveryInfo.deliveryDistance} miles)`;
    case DELIVERY_OPTIONS.PICKUP_REQUIRED:
      return `Pickup required (${deliveryInfo.deliveryDistance} miles away)`;
    case DELIVERY_OPTIONS.OUT_OF_RANGE:
      return 'Not available - out of delivery range';
    default:
      return 'Delivery information unavailable';
  }
}

/**
 * Check if booking is possible based on delivery option
 * @param {string} deliveryOption - Delivery option from calculateDeliveryFee
 * @returns {boolean} - Whether booking can proceed
 */
export function canBookWithDeliveryOption(deliveryOption) {
  return deliveryOption !== DELIVERY_OPTIONS.OUT_OF_RANGE;
}

export default {
  DELIVERY_OPTIONS,
  calculateDistance,
  calculateDeliveryFee,
  calculateDeliveryFromCoordinates,
  validateDeliverySettings,
  getRecommendedDeliverySettings,
  formatDeliveryInfo,
  canBookWithDeliveryOption,
};
