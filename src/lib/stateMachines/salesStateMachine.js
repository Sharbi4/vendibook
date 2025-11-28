/**
 * Sales State Machine for Vendibook
 *
 * Complete Sales Flow:
 * =====================
 * 1. SELLER CREATES FOR SALE LISTING
 *    - Category: Food truck, Food trailer, Vendor cart, Other mobile equipment
 *    - Details: Title, description, photos, video link, year/make/model
 *    - Specs: Mileage, hours, equipment list, layout, dimensions, condition
 *    - Price: Asking price, location (masked publicly)
 *    - Options: Delivery/shipping, upsells (inspection, notary, title services)
 *    - Documents: Title/ownership proof, VIN/serial, inspection reports
 *
 * 2. LISTING STATUS → Published (Listed state)
 *
 * 3. BUYER BROWSING → Photos, description, price, general location only
 *    - Badges: Title verified, inspection available
 *    - Full address is MASKED until payment
 *
 * 4. BUYER SENDS INQUIRY/OFFER → Creates SaleTransaction → UnderOffer
 *    - Messaging thread opens
 *
 * 5. NEGOTIATION → Buyer/seller adjust price & terms
 *    - Seller can decline → Canceled
 *    - Seller accepts → OfferAccepted
 *
 * 6. PAYMENT STEP → PaymentPending → Paid
 *    - On Paid: Funds held in escrow, full address revealed, messaging continues
 *
 * 7. TRANSFER PHASE
 *    - In-person pickup OR Shipping
 *    - Title/document transfer (optional notary)
 *    - State → InTransfer (optional for complex workflows)
 *
 * 8. CONFIRMATION
 *    - Buyer confirms receipt
 *    - Seller confirms transfer complete
 *    - State → Completed
 *
 * 9. PAYOUT
 *    - 13% commission from seller proceeds
 *    - Payment processor fees deducted
 *    - Net payout to seller
 *    - Messaging closes
 *    - Listing marked as Sold
 *
 * Key Rules:
 * - Seller pays 13% commission on final sale price
 * - Buyer pays NO Vendibook service fee
 * - Card processing fees apply only if buyer chooses card
 * - Before payment: Only general location visible (city, area, approximate map)
 * - After payment: Full address and exact pickup/delivery details revealed
 * - Messaging: Opens at UnderOffer, continues through Paid, closes at Completed/Canceled
 * - Escrow: Funds held until transfer confirmed, then released to seller
 */

export const SALES_STATES = {
  LISTED: 'Listed',           // Published listing, waiting for buyer offers
  UNDER_OFFER: 'UnderOffer',  // Buyer sent inquiry/offer, SaleTransaction created
  OFFER_ACCEPTED: 'OfferAccepted', // Seller accepted deal terms
  PAYMENT_PENDING: 'PaymentPending', // Buyer completing payment
  PAID: 'Paid',               // Payment confirmed, funds in escrow, address revealed
  IN_TRANSFER: 'InTransfer',  // Optional: Shipping or complex title workflows
  COMPLETED: 'Completed',     // Funds released, listing marked Sold
  CANCELED: 'Canceled',       // Deal failed or canceled
};

// Valid state transitions
const VALID_TRANSITIONS = {
  [SALES_STATES.LISTED]: [
    SALES_STATES.UNDER_OFFER, // First buyer contact
    SALES_STATES.CANCELED,    // Seller withdraws listing
  ],
  [SALES_STATES.UNDER_OFFER]: [
    SALES_STATES.OFFER_ACCEPTED, // Seller accepts offer
    SALES_STATES.LISTED,         // Offer declined, back to listed
    SALES_STATES.CANCELED,       // Deal falls through
  ],
  [SALES_STATES.OFFER_ACCEPTED]: [
    SALES_STATES.PAYMENT_PENDING, // Buyer proceeds to payment
    SALES_STATES.UNDER_OFFER,     // Terms renegotiated
    SALES_STATES.CANCELED,        // Buyer backs out
  ],
  [SALES_STATES.PAYMENT_PENDING]: [
    SALES_STATES.PAID,       // Payment successful
    SALES_STATES.CANCELED,   // Payment failed/abandoned
  ],
  [SALES_STATES.PAID]: [
    SALES_STATES.IN_TRANSFER, // Complex transfer workflow
    SALES_STATES.COMPLETED,   // Direct completion (simple pickup)
    SALES_STATES.CANCELED,    // Rare: Admin override for disputes
  ],
  [SALES_STATES.IN_TRANSFER]: [
    SALES_STATES.COMPLETED,  // Transfer confirmed
    SALES_STATES.CANCELED,   // Transfer failed
  ],
  [SALES_STATES.COMPLETED]: [], // Terminal state - payout released
  [SALES_STATES.CANCELED]: [],  // Terminal state - no payout
};

/**
 * Validates if a state transition is allowed
 * @param {string} currentState - Current sale state
 * @param {string} nextState - Desired next state
 * @returns {boolean} - Whether transition is valid
 */
export function canTransition(currentState, nextState) {
  const allowedTransitions = VALID_TRANSITIONS[currentState];

  if (!allowedTransitions) {
    throw new Error(`Invalid current state: ${currentState}`);
  }

  return allowedTransitions.includes(nextState);
}

/**
 * Validates state transition and throws error if invalid
 * @param {string} currentState
 * @param {string} nextState
 * @throws {Error} if transition is invalid
 */
export function validateTransition(currentState, nextState) {
  if (!canTransition(currentState, nextState)) {
    throw new Error(
      `Invalid state transition from ${currentState} to ${nextState}. ` +
      `Allowed transitions: ${VALID_TRANSITIONS[currentState].join(', ')}`
    );
  }
}

/**
 * Checks if messaging is allowed for given state
 * Messaging opens at UnderOffer, continues through Paid/InTransfer
 * Messaging closes at Completed or Canceled
 * @param {string} state - Sale state
 * @returns {boolean} - True if messaging is allowed
 */
export function canSendMessages(state) {
  const messagingStates = [
    SALES_STATES.UNDER_OFFER,
    SALES_STATES.OFFER_ACCEPTED,
    SALES_STATES.PAYMENT_PENDING,
    SALES_STATES.PAID,
    SALES_STATES.IN_TRANSFER,
  ];

  return messagingStates.includes(state);
}

/**
 * Checks if address should be masked (not revealed to buyer)
 * Address is revealed ONLY after payment is confirmed (Paid state or later)
 * @param {string} state - Sale state
 * @returns {boolean} - True if address should be masked
 */
export function shouldMaskAddress(state) {
  // Address is masked in all states BEFORE Paid
  const maskedStates = [
    SALES_STATES.LISTED,
    SALES_STATES.UNDER_OFFER,
    SALES_STATES.OFFER_ACCEPTED,
    SALES_STATES.PAYMENT_PENDING,
  ];

  return maskedStates.includes(state);
}

/**
 * Checks if funds should be held in escrow
 * Funds are held from Paid until Completed
 * @param {string} state - Sale state
 * @returns {boolean} - True if funds should be in escrow
 */
export function shouldHoldFundsInEscrow(state) {
  const escrowStates = [
    SALES_STATES.PAID,
    SALES_STATES.IN_TRANSFER,
  ];

  return escrowStates.includes(state);
}

/**
 * Checks if payout should be released for given state
 * @param {string} state - Sale state
 * @returns {boolean} - True if payout should be released
 */
export function shouldReleasePayout(state) {
  return state === SALES_STATES.COMPLETED;
}

/**
 * Checks if listing should be hidden from marketplace
 * @param {string} state - Sale state
 * @returns {boolean} - True if listing should be hidden
 */
export function shouldHideListing(state) {
  // Hide listing once offer is accepted
  return state !== SALES_STATES.LISTED;
}

/**
 * Gets state-specific actions and permissions
 * @param {string} state - Sale state
 * @returns {Object} - State permissions object
 */
export function getStatePermissions(state) {
  return {
    canTransitionTo: VALID_TRANSITIONS[state] || [],
    messagingEnabled: canSendMessages(state),
    addressMasked: shouldMaskAddress(state),
    fundsInEscrow: shouldHoldFundsInEscrow(state),
    payoutReleased: shouldReleasePayout(state),
    listingHidden: shouldHideListing(state),
    isTerminal: state === SALES_STATES.COMPLETED || state === SALES_STATES.CANCELED,
  };
}

/**
 * Creates state history entry
 * @param {string} state - New state
 * @param {string} notes - Optional notes about the transition
 * @returns {Object} - State history entry
 */
export function createStateHistoryEntry(state, notes = '') {
  return {
    state,
    timestamp: new Date().toISOString(),
    notes,
  };
}

/**
 * Transition sale to new state with validation
 * @param {Object} sale - Current sale object
 * @param {string} nextState - Desired next state
 * @param {string} notes - Optional notes
 * @returns {Object} - Updated sale object
 */
export function transitionSale(sale, nextState, notes = '') {
  // Validate transition
  validateTransition(sale.state, nextState);

  // Create history entry
  const historyEntry = createStateHistoryEntry(nextState, notes);
  const stateHistory = [...(sale.state_history || []), historyEntry];

  // Update timestamps based on state
  const timestamps = {};

  switch (nextState) {
    case SALES_STATES.UNDER_OFFER:
      timestamps.offer_made_at = new Date().toISOString();
      break;
    case SALES_STATES.OFFER_ACCEPTED:
      timestamps.offer_accepted_at = new Date().toISOString();
      break;
    case SALES_STATES.PAYMENT_PENDING:
      timestamps.payment_pending_at = new Date().toISOString();
      break;
    case SALES_STATES.PAID:
      timestamps.paid_at = new Date().toISOString();
      break;
    case SALES_STATES.IN_TRANSFER:
      timestamps.in_transfer_at = new Date().toISOString();
      break;
    case SALES_STATES.COMPLETED:
      timestamps.completed_at = new Date().toISOString();
      break;
    case SALES_STATES.CANCELED:
      timestamps.canceled_at = new Date().toISOString();
      break;
  }

  return {
    ...sale,
    state: nextState,
    state_history: stateHistory,
    ...timestamps,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Get user-friendly state label
 * @param {string} state - Sale state
 * @returns {string} - Human-readable state label
 */
export function getStateLabel(state) {
  const labels = {
    [SALES_STATES.LISTED]: 'Listed for Sale',
    [SALES_STATES.UNDER_OFFER]: 'Offer Received',
    [SALES_STATES.OFFER_ACCEPTED]: 'Offer Accepted',
    [SALES_STATES.PAYMENT_PENDING]: 'Awaiting Payment',
    [SALES_STATES.PAID]: 'Payment Received',
    [SALES_STATES.IN_TRANSFER]: 'In Transfer',
    [SALES_STATES.COMPLETED]: 'Sale Completed',
    [SALES_STATES.CANCELED]: 'Canceled',
  };

  return labels[state] || state;
}

/**
 * Get next action user should take based on state and role
 * @param {string} state - Sale state
 * @param {string} role - User role ('buyer' or 'seller')
 * @returns {string} - Next action message
 */
export function getNextAction(state, role) {
  if (role === 'buyer') {
    const buyerActions = {
      [SALES_STATES.LISTED]: 'Make an offer to purchase this equipment.',
      [SALES_STATES.UNDER_OFFER]: 'Waiting for seller to respond to your offer.',
      [SALES_STATES.OFFER_ACCEPTED]: 'Seller accepted your offer! Proceed to payment.',
      [SALES_STATES.PAYMENT_PENDING]: 'Complete payment to secure this purchase.',
      [SALES_STATES.PAID]: 'Payment complete! Full address and pickup details are now available. Coordinate transfer with seller.',
      [SALES_STATES.IN_TRANSFER]: 'Equipment transfer in progress. Confirm receipt when complete.',
      [SALES_STATES.COMPLETED]: 'Purchase completed successfully. Leave a review for the seller!',
      [SALES_STATES.CANCELED]: 'This sale was canceled.',
    };
    return buyerActions[state] || '';
  }

  if (role === 'seller') {
    const sellerActions = {
      [SALES_STATES.LISTED]: 'Your equipment is listed. Wait for buyer inquiries and offers.',
      [SALES_STATES.UNDER_OFFER]: 'Review the offer and accept or decline. Message the buyer to negotiate.',
      [SALES_STATES.OFFER_ACCEPTED]: 'Offer accepted! Waiting for buyer to complete payment.',
      [SALES_STATES.PAYMENT_PENDING]: 'Buyer is completing payment. Stand by.',
      [SALES_STATES.PAID]: 'Payment received and held in escrow. Coordinate equipment transfer with buyer.',
      [SALES_STATES.IN_TRANSFER]: 'Equipment transfer in progress. Confirm when title and possession are transferred.',
      [SALES_STATES.COMPLETED]: 'Sale completed! Your payout (minus 13% commission) has been initiated.',
      [SALES_STATES.CANCELED]: 'This sale was canceled.',
    };
    return sellerActions[state] || '';
  }

  return '';
}

/**
 * Get fee structure for a sale
 * @param {number} salePrice - Final sale price
 * @returns {Object} - Fee breakdown
 */
export function calculateSaleFees(salePrice) {
  const SELLER_COMMISSION_RATE = 0.13; // 13% commission from seller
  const BUYER_FEE_RATE = 0; // Buyer pays NO Vendibook fee
  
  const sellerCommission = salePrice * SELLER_COMMISSION_RATE;
  const buyerFee = salePrice * BUYER_FEE_RATE;
  const sellerPayout = salePrice - sellerCommission;
  const buyerTotal = salePrice + buyerFee;

  return {
    salePrice,
    sellerCommissionRate: SELLER_COMMISSION_RATE,
    sellerCommission,
    buyerFeeRate: BUYER_FEE_RATE,
    buyerFee,
    sellerPayout,
    buyerTotal,
  };
}

/**
 * Upsell types available for sales
 */
export const SALE_UPSELLS = {
  INSPECTION: 'inspection',           // Third-party or platform inspection
  SHIPPING: 'shipping',               // Freight/shipping service
  NOTARY: 'notary',                   // Notary services via Proof
  TITLE_VERIFICATION: 'title_verification', // Title verification
  BRANDING_KIT: 'branding_kit',       // Temporary branding kit
};

export default {
  SALES_STATES,
  SALE_UPSELLS,
  canTransition,
  validateTransition,
  canSendMessages,
  shouldMaskAddress,
  shouldHoldFundsInEscrow,
  shouldReleasePayout,
  shouldHideListing,
  getStatePermissions,
  createStateHistoryEntry,
  transitionSale,
  getStateLabel,
  getNextAction,
  calculateSaleFees,
};
