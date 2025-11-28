/**
 * Booking State Machine for Vendibook
 *
 * State Flow:
 * Requested → HostApproved → Paid → InProgress → ReturnedPendingConfirmation → Completed
 * Any state can transition to → Canceled
 *
 * Critical Rules:
 * - Address masking remains active until state = 'Paid'
 * - Messaging only available in: Requested, HostApproved, Paid, InProgress, ReturnedPendingConfirmation
 * - Calendar locks immediately when state = 'Paid'
 * - Payout releases only when state = 'Completed'
 */

export const BOOKING_STATES = {
  REQUESTED: 'Requested',
  HOST_APPROVED: 'HostApproved',
  PAID: 'Paid',
  IN_PROGRESS: 'InProgress',
  RETURNED_PENDING_CONFIRMATION: 'ReturnedPendingConfirmation',
  COMPLETED: 'Completed',
  CANCELED: 'Canceled',
};

// Valid state transitions
const VALID_TRANSITIONS = {
  [BOOKING_STATES.REQUESTED]: [
    BOOKING_STATES.HOST_APPROVED,
    BOOKING_STATES.CANCELED,
  ],
  [BOOKING_STATES.HOST_APPROVED]: [
    BOOKING_STATES.PAID,
    BOOKING_STATES.CANCELED,
  ],
  [BOOKING_STATES.PAID]: [
    BOOKING_STATES.IN_PROGRESS,
    BOOKING_STATES.CANCELED,
  ],
  [BOOKING_STATES.IN_PROGRESS]: [
    BOOKING_STATES.RETURNED_PENDING_CONFIRMATION,
    BOOKING_STATES.CANCELED,
  ],
  [BOOKING_STATES.RETURNED_PENDING_CONFIRMATION]: [
    BOOKING_STATES.COMPLETED,
    BOOKING_STATES.CANCELED,
  ],
  [BOOKING_STATES.COMPLETED]: [], // Terminal state
  [BOOKING_STATES.CANCELED]: [], // Terminal state
};

/**
 * Validates if a state transition is allowed
 * @param {string} currentState - Current booking state
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
 * Checks if address should be masked for given state
 * @param {string} state - Booking state
 * @returns {boolean} - True if address should be masked
 */
export function shouldMaskAddress(state) {
  // Address is masked until booking is Paid
  return state !== BOOKING_STATES.PAID &&
         state !== BOOKING_STATES.IN_PROGRESS &&
         state !== BOOKING_STATES.RETURNED_PENDING_CONFIRMATION &&
         state !== BOOKING_STATES.COMPLETED;
}

/**
 * Checks if messaging is allowed for given state
 * @param {string} state - Booking state
 * @returns {boolean} - True if messaging is allowed
 */
export function canSendMessages(state) {
  const messagingStates = [
    BOOKING_STATES.REQUESTED,
    BOOKING_STATES.HOST_APPROVED,
    BOOKING_STATES.PAID,
    BOOKING_STATES.IN_PROGRESS,
    BOOKING_STATES.RETURNED_PENDING_CONFIRMATION,
  ];

  return messagingStates.includes(state);
}

/**
 * Checks if calendar should be locked for given state
 * @param {string} state - Booking state
 * @returns {boolean} - True if calendar should be locked
 */
export function shouldLockCalendar(state) {
  // Calendar locks when booking is paid and stays locked until completed/canceled
  return state === BOOKING_STATES.PAID ||
         state === BOOKING_STATES.IN_PROGRESS ||
         state === BOOKING_STATES.RETURNED_PENDING_CONFIRMATION;
}

/**
 * Checks if payout should be released for given state
 * @param {string} state - Booking state
 * @returns {boolean} - True if payout should be released
 */
export function shouldReleasePayout(state) {
  return state === BOOKING_STATES.COMPLETED;
}

/**
 * Gets state-specific actions and permissions
 * @param {string} state - Booking state
 * @returns {Object} - State permissions object
 */
export function getStatePermissions(state) {
  return {
    canTransitionTo: VALID_TRANSITIONS[state] || [],
    addressMasked: shouldMaskAddress(state),
    messagingEnabled: canSendMessages(state),
    calendarLocked: shouldLockCalendar(state),
    payoutReleased: shouldReleasePayout(state),
    isTerminal: state === BOOKING_STATES.COMPLETED || state === BOOKING_STATES.CANCELED,
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
 * Transition booking to new state with validation
 * @param {Object} booking - Current booking object
 * @param {string} nextState - Desired next state
 * @param {string} notes - Optional notes
 * @returns {Object} - Updated booking object
 */
export function transitionBooking(booking, nextState, notes = '') {
  // Validate transition
  validateTransition(booking.state, nextState);

  // Create history entry
  const historyEntry = createStateHistoryEntry(nextState, notes);
  const stateHistory = [...(booking.state_history || []), historyEntry];

  // Update timestamps based on state
  const timestamps = {};

  switch (nextState) {
    case BOOKING_STATES.HOST_APPROVED:
      timestamps.approved_at = new Date().toISOString();
      break;
    case BOOKING_STATES.PAID:
      timestamps.paid_at = new Date().toISOString();
      break;
    case BOOKING_STATES.IN_PROGRESS:
      timestamps.started_at = new Date().toISOString();
      break;
    case BOOKING_STATES.RETURNED_PENDING_CONFIRMATION:
      timestamps.returned_at = new Date().toISOString();
      break;
    case BOOKING_STATES.COMPLETED:
      timestamps.completed_at = new Date().toISOString();
      break;
    case BOOKING_STATES.CANCELED:
      timestamps.canceled_at = new Date().toISOString();
      break;
  }

  return {
    ...booking,
    state: nextState,
    state_history: stateHistory,
    ...timestamps,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Get user-friendly state label
 * @param {string} state - Booking state
 * @returns {string} - Human-readable state label
 */
export function getStateLabel(state) {
  const labels = {
    [BOOKING_STATES.REQUESTED]: 'Pending Host Approval',
    [BOOKING_STATES.HOST_APPROVED]: 'Approved - Awaiting Payment',
    [BOOKING_STATES.PAID]: 'Paid - Ready for Pickup/Delivery',
    [BOOKING_STATES.IN_PROGRESS]: 'Rental In Progress',
    [BOOKING_STATES.RETURNED_PENDING_CONFIRMATION]: 'Returned - Awaiting Host Confirmation',
    [BOOKING_STATES.COMPLETED]: 'Completed',
    [BOOKING_STATES.CANCELED]: 'Canceled',
  };

  return labels[state] || state;
}

/**
 * Get next action user should take based on state and role
 * @param {string} state - Booking state
 * @param {string} role - User role ('renter' or 'host')
 * @returns {string} - Next action message
 */
export function getNextAction(state, role) {
  if (role === 'renter') {
    const renterActions = {
      [BOOKING_STATES.REQUESTED]: 'Waiting for host to approve your booking request.',
      [BOOKING_STATES.HOST_APPROVED]: 'Complete payment to confirm your booking.',
      [BOOKING_STATES.PAID]: 'Rental is confirmed. Check access instructions and prepare for pickup/delivery.',
      [BOOKING_STATES.IN_PROGRESS]: 'Enjoy your rental! Return equipment by the end date.',
      [BOOKING_STATES.RETURNED_PENDING_CONFIRMATION]: 'Equipment returned. Waiting for host to confirm.',
      [BOOKING_STATES.COMPLETED]: 'Booking completed. Leave a review!',
      [BOOKING_STATES.CANCELED]: 'This booking was canceled.',
    };
    return renterActions[state] || '';
  }

  if (role === 'host') {
    const hostActions = {
      [BOOKING_STATES.REQUESTED]: 'Review and approve/decline the booking request.',
      [BOOKING_STATES.HOST_APPROVED]: 'Waiting for renter to complete payment.',
      [BOOKING_STATES.PAID]: 'Prepare equipment for delivery/pickup.',
      [BOOKING_STATES.IN_PROGRESS]: 'Rental period in progress.',
      [BOOKING_STATES.RETURNED_PENDING_CONFIRMATION]: 'Inspect returned equipment and confirm condition.',
      [BOOKING_STATES.COMPLETED]: 'Booking completed. Payout has been initiated.',
      [BOOKING_STATES.CANCELED]: 'This booking was canceled.',
    };
    return hostActions[state] || '';
  }

  return '';
}

export default {
  BOOKING_STATES,
  canTransition,
  validateTransition,
  shouldMaskAddress,
  canSendMessages,
  shouldLockCalendar,
  shouldReleasePayout,
  getStatePermissions,
  createStateHistoryEntry,
  transitionBooking,
  getStateLabel,
  getNextAction,
};
