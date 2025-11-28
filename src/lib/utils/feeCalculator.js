/**
 * Fee Calculator for Vendibook Platform
 *
 * Rental Fees:
 * - Renters pay 13% service fee
 * - Hosts pay 10% commission
 *
 * Sales Fees:
 * - Buyers pay 0% service fee
 * - Sellers pay 13% commission
 *
 * All calculations use 2 decimal precision for currency
 */

// Fee percentages as constants
export const FEE_RATES = {
  RENTAL_RENTER_FEE: 0.13, // 13% renter service fee
  RENTAL_HOST_COMMISSION: 0.10, // 10% host commission
  SALE_BUYER_FEE: 0.00, // 0% buyer service fee
  SALE_SELLER_COMMISSION: 0.13, // 13% seller commission
  STRIPE_PERCENTAGE: 0.029, // 2.9% Stripe fee
  STRIPE_FIXED: 0.30, // $0.30 Stripe fixed fee
};

/**
 * Rounds a number to 2 decimal places for currency
 * @param {number} amount - Amount to round
 * @returns {number} - Rounded amount
 */
function roundCurrency(amount) {
  return Math.round(amount * 100) / 100;
}

/**
 * Calculate rental booking fees
 * @param {Object} params - Booking parameters
 * @param {number} params.basePrice - Base rental price (daily/weekly rate * days)
 * @param {number} params.deliveryFee - Delivery fee (default: 0)
 * @param {number} params.upsellTotal - Total upsell amount (default: 0)
 * @returns {Object} - Complete fee breakdown
 */
export function calculateRentalFees({
  basePrice,
  deliveryFee = 0,
  upsellTotal = 0,
}) {
  if (basePrice < 0 || deliveryFee < 0 || upsellTotal < 0) {
    throw new Error('All amounts must be non-negative');
  }

  const subtotal = roundCurrency(basePrice + deliveryFee + upsellTotal);
  const renterServiceFee = roundCurrency(subtotal * FEE_RATES.RENTAL_RENTER_FEE);
  const totalRenterPays = roundCurrency(subtotal + renterServiceFee);

  // Stripe fee on total amount renter pays
  const paymentProcessorFee = roundCurrency(
    totalRenterPays * FEE_RATES.STRIPE_PERCENTAGE + FEE_RATES.STRIPE_FIXED
  );

  const hostCommission = roundCurrency(subtotal * FEE_RATES.RENTAL_HOST_COMMISSION);
  const hostPayout = roundCurrency(subtotal - hostCommission - paymentProcessorFee);

  return {
    basePrice: roundCurrency(basePrice),
    deliveryFee: roundCurrency(deliveryFee),
    upsellTotal: roundCurrency(upsellTotal),
    subtotal,
    renterServiceFee,
    totalRenterPays,
    hostCommission,
    paymentProcessorFee,
    hostPayout,
    platformRevenue: roundCurrency(renterServiceFee + hostCommission),
  };
}

/**
 * Calculate sale transaction fees
 * @param {Object} params - Sale parameters
 * @param {number} params.salePrice - Sale price of equipment
 * @param {number} params.upsellTotal - Total upsell amount (shipping, inspection, etc.) (default: 0)
 * @returns {Object} - Complete fee breakdown
 */
export function calculateSaleFees({
  salePrice,
  upsellTotal = 0,
}) {
  if (salePrice < 0 || upsellTotal < 0) {
    throw new Error('All amounts must be non-negative');
  }

  const subtotal = roundCurrency(salePrice + upsellTotal);
  const buyerServiceFee = 0; // Buyers pay 0%
  const totalBuyerPays = subtotal;

  // Stripe fee on total amount buyer pays
  const paymentProcessorFee = roundCurrency(
    totalBuyerPays * FEE_RATES.STRIPE_PERCENTAGE + FEE_RATES.STRIPE_FIXED
  );

  const sellerCommission = roundCurrency(subtotal * FEE_RATES.SALE_SELLER_COMMISSION);
  const sellerPayout = roundCurrency(subtotal - sellerCommission - paymentProcessorFee);

  return {
    salePrice: roundCurrency(salePrice),
    upsellTotal: roundCurrency(upsellTotal),
    subtotal,
    buyerServiceFee,
    totalBuyerPays,
    sellerCommission,
    paymentProcessorFee,
    sellerPayout,
    platformRevenue: sellerCommission,
  };
}

/**
 * Calculate rental price based on duration
 * @param {Object} params - Pricing parameters
 * @param {number} params.dailyRate - Daily rental rate
 * @param {number} params.weeklyRate - Weekly rental rate (optional)
 * @param {number} params.monthlyRate - Monthly rental rate (optional)
 * @param {number} params.rentalDays - Number of rental days
 * @returns {Object} - Price breakdown
 */
export function calculateRentalPrice({
  dailyRate,
  weeklyRate = null,
  monthlyRate = null,
  rentalDays,
}) {
  if (rentalDays < 1) {
    throw new Error('Rental days must be at least 1');
  }

  let basePrice;
  let pricingType;

  // Use best pricing tier available
  if (monthlyRate && rentalDays >= 28) {
    const months = Math.floor(rentalDays / 28);
    const remainingDays = rentalDays % 28;
    basePrice = months * monthlyRate + remainingDays * dailyRate;
    pricingType = 'monthly';
  } else if (weeklyRate && rentalDays >= 7) {
    const weeks = Math.floor(rentalDays / 7);
    const remainingDays = rentalDays % 7;
    basePrice = weeks * weeklyRate + remainingDays * dailyRate;
    pricingType = 'weekly';
  } else {
    basePrice = rentalDays * dailyRate;
    pricingType = 'daily';
  }

  return {
    basePrice: roundCurrency(basePrice),
    rentalDays,
    pricingType,
    dailyRate: roundCurrency(dailyRate),
    weeklyRate: weeklyRate ? roundCurrency(weeklyRate) : null,
    monthlyRate: monthlyRate ? roundCurrency(monthlyRate) : null,
  };
}

/**
 * Get pricing summary for display to users
 * @param {Object} fees - Fee breakdown from calculateRentalFees or calculateSaleFees
 * @param {string} type - 'rental' or 'sale'
 * @returns {Array} - Array of line items for display
 */
export function getPricingSummary(fees, type = 'rental') {
  if (type === 'rental') {
    return [
      { label: 'Base Price', amount: fees.basePrice },
      ...(fees.deliveryFee > 0 ? [{ label: 'Delivery Fee', amount: fees.deliveryFee }] : []),
      ...(fees.upsellTotal > 0 ? [{ label: 'Add-ons', amount: fees.upsellTotal }] : []),
      { label: 'Subtotal', amount: fees.subtotal, bold: true },
      { label: 'Service Fee (13%)', amount: fees.renterServiceFee },
      { label: 'Total', amount: fees.totalRenterPays, bold: true, large: true },
    ];
  }

  if (type === 'sale') {
    return [
      { label: 'Sale Price', amount: fees.salePrice },
      ...(fees.upsellTotal > 0 ? [{ label: 'Add-ons (shipping, etc.)', amount: fees.upsellTotal }] : []),
      { label: 'Subtotal', amount: fees.subtotal, bold: true },
      { label: 'Service Fee', amount: fees.buyerServiceFee },
      { label: 'Total', amount: fees.totalBuyerPays, bold: true, large: true },
    ];
  }

  throw new Error('Type must be "rental" or "sale"');
}

/**
 * Get host/seller payout summary
 * @param {Object} fees - Fee breakdown
 * @param {string} type - 'rental' or 'sale'
 * @returns {Array} - Array of line items for display
 */
export function getPayoutSummary(fees, type = 'rental') {
  if (type === 'rental') {
    return [
      { label: 'Subtotal', amount: fees.subtotal },
      { label: 'Platform Commission (10%)', amount: -fees.hostCommission, negative: true },
      { label: 'Payment Processing Fee', amount: -fees.paymentProcessorFee, negative: true },
      { label: 'Your Payout', amount: fees.hostPayout, bold: true, large: true },
    ];
  }

  if (type === 'sale') {
    return [
      { label: 'Subtotal', amount: fees.subtotal },
      { label: 'Platform Commission (13%)', amount: -fees.sellerCommission, negative: true },
      { label: 'Payment Processing Fee', amount: -fees.paymentProcessorFee, negative: true },
      { label: 'Your Payout', amount: fees.sellerPayout, bold: true, large: true },
    ];
  }

  throw new Error('Type must be "rental" or "sale"');
}

/**
 * Validate upsell items and calculate total
 * @param {Array} upsellItems - Array of {name, price, description}
 * @returns {number} - Total upsell amount
 */
export function calculateUpsellTotal(upsellItems = []) {
  if (!Array.isArray(upsellItems)) {
    throw new Error('Upsell items must be an array');
  }

  return roundCurrency(
    upsellItems.reduce((total, item) => {
      if (typeof item.price !== 'number' || item.price < 0) {
        throw new Error('Each upsell item must have a non-negative price');
      }
      return total + item.price;
    }, 0)
  );
}

export default {
  FEE_RATES,
  calculateRentalFees,
  calculateSaleFees,
  calculateRentalPrice,
  calculateUpsellTotal,
  getPricingSummary,
  getPayoutSummary,
};
