/**
 * Sales State Machine for Vendibook
 *
 * State Flow:
 * Listed → UnderOffer → OfferAccepted → PaymentPending → Paid → InTransfer → Completed
 * Any state can transition to → Canceled
 *
 * Critical Rules:
 * - Sellers pay 13% commission
 * - Buyers pay 0% service fee
 * - Messaging allowed only within transaction window
 * - Payout releases only when state = 'Completed'
 */

export const SALES_STATES = {
  LISTED: 'Listed',
  UNDER_OFFER: 'UnderOffer',
  OFFER_ACCEPTED: 'OfferAccepted',
  PAYMENT_PENDING: 'PaymentPending',
  PAID: 'Paid',
  IN_TRANSFER: 'InTransfer',
  COMPLETED: 'Completed',
  CANCELED: 'Canceled',
};

// Valid state transitions
const VALID_TRANSITIONS = {
  [SALES_STATES.LISTED]: [
    SALES_STATES.UNDER_OFFER,
    SALES_STATES.CANCELED,
  ],
  [SALES_STATES.UNDER_OFFER]: [
    SALES_STATES.OFFER_ACCEPTED,
    SALES_STATES.LISTED, // Can go back if offer is declined
    SALES_STATES.CANCELED,
  ],
  [SALES_STATES.OFFER_ACCEPTED]: [
    SALES_STATES.PAYMENT_PENDING,
    SALES_STATES.CANCELED,
  ],
  [SALES_STATES.PAYMENT_PENDING]: [
    SALES_STATES.PAID,
    SALES_STATES.CANCELED,
  ],
  [SALES_STATES.PAID]: [
    SALES_STATES.IN_TRANSFER,
    SALES_STATES.CANCELED,
  ],
  [SALES_STATES.IN_TRANSFER]: [
    SALES_STATES.COMPLETED,
    SALES_STATES.CANCELED,
  ],
  [SALES_STATES.COMPLETED]: [], // Terminal state
  [SALES_STATES.CANCELED]: [], // Terminal state
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
 * @param {string} state - Sale state
 * @returns {boolean} - True if messaging is allowed
 */
export function canSendMessages(state) {
  // Messaging allowed from UnderOffer through InTransfer
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
      [SALES_STATES.OFFER_ACCEPTED]: 'Seller accepted your offer! Proceeding to payment.',
      [SALES_STATES.PAYMENT_PENDING]: 'Complete payment to secure this purchase.',
      [SALES_STATES.PAID]: 'Payment complete. Coordinate with seller for transfer.',
      [SALES_STATES.IN_TRANSFER]: 'Equipment transfer in progress.',
      [SALES_STATES.COMPLETED]: 'Purchase completed. Leave a review!',
      [SALES_STATES.CANCELED]: 'This sale was canceled.',
    };
    return buyerActions[state] || '';
  }

  if (role === 'seller') {
    const sellerActions = {
      [SALES_STATES.LISTED]: 'Your equipment is listed. Wait for buyer offers.',
      [SALES_STATES.UNDER_OFFER]: 'Review the offer and accept or decline.',
      [SALES_STATES.OFFER_ACCEPTED]: 'Offer accepted. Waiting for buyer payment.',
      [SALES_STATES.PAYMENT_PENDING]: 'Buyer is completing payment.',
      [SALES_STATES.PAID]: 'Payment received. Coordinate equipment transfer with buyer.',
      [SALES_STATES.IN_TRANSFER]: 'Equipment transfer in progress.',
      [SALES_STATES.COMPLETED]: 'Sale completed. Payout has been initiated.',
      [SALES_STATES.CANCELED]: 'This sale was canceled.',
    };
    return sellerActions[state] || '';
  }

  return '';
}

export default {
  SALES_STATES,
  canTransition,
  validateTransition,
  canSendMessages,
  shouldReleasePayout,
  shouldHideListing,
  getStatePermissions,
  createStateHistoryEntry,
  transitionSale,
  getStateLabel,
  getNextAction,
};
