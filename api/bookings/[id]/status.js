import { 
  sql, 
  bootstrapBookingsTable, 
  BOOKING_STATUS, 
  BOOKING_TRANSITIONS,
  canTransitionBooking 
} from '../../src/api/db.js';

/**
 * Booking Status Transition API
 * PUT /api/bookings/[id]/status - Update booking status
 * 
 * This endpoint enforces the booking state machine:
 * PENDING → HOST_APPROVED/DECLINED/CANCELED/EXPIRED
 * HOST_APPROVED → PAID/CANCELED/EXPIRED
 * PAID → IN_PROGRESS/CANCELED/DISPUTED
 * IN_PROGRESS → COMPLETED/DISPUTED
 * COMPLETED → DISPUTED
 */
export default async function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    res.setHeader('Allow', 'PUT, POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await bootstrapBookingsTable();
  } catch (error) {
    console.error('Failed to bootstrap bookings:', error);
    return res.status(500).json({ success: false, error: 'Server initialization failed' });
  }

  try {
    const bookingId = req.query.id;
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: 'Booking ID is required'
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { 
      newStatus, 
      userId,
      reason,
      notes 
    } = body;

    if (!newStatus) {
      return res.status(400).json({
        success: false,
        error: 'newStatus is required'
      });
    }

    // Get current booking
    const [booking] = await sql`
      SELECT 
        id, status, renter_user_id, host_user_id, listing_id,
        start_date, end_date, total_price
      FROM bookings
      WHERE id = ${bookingId}
      LIMIT 1
    `;

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const currentStatus = booking.status;

    // Check if transition is valid
    if (!canTransitionBooking(currentStatus, newStatus)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TRANSITION',
        message: `Cannot transition from ${currentStatus} to ${newStatus}`,
        allowedTransitions: BOOKING_TRANSITIONS[currentStatus] || []
      });
    }

    // Authorization check
    const isHost = userId === booking.host_user_id;
    const isRenter = userId === booking.renter_user_id;

    // Validate who can make which transitions
    const transitionRules = {
      [BOOKING_STATUS.HOST_APPROVED]: { allowedBy: ['host'] },
      [BOOKING_STATUS.DECLINED]: { allowedBy: ['host'] },
      [BOOKING_STATUS.PAID]: { allowedBy: ['renter', 'system'] },
      [BOOKING_STATUS.IN_PROGRESS]: { allowedBy: ['host', 'system'] },
      [BOOKING_STATUS.COMPLETED]: { allowedBy: ['host', 'renter'] },
      [BOOKING_STATUS.CANCELED]: { allowedBy: ['host', 'renter'] },
      [BOOKING_STATUS.DISPUTED]: { allowedBy: ['host', 'renter'] },
      [BOOKING_STATUS.EXPIRED]: { allowedBy: ['system'] }
    };

    const rule = transitionRules[newStatus];
    if (rule) {
      const userRole = isHost ? 'host' : isRenter ? 'renter' : 'system';
      if (!rule.allowedBy.includes(userRole) && !rule.allowedBy.includes('system')) {
        return res.status(403).json({
          success: false,
          error: 'UNAUTHORIZED_TRANSITION',
          message: `Only ${rule.allowedBy.join(' or ')} can make this transition`
        });
      }
    }

    // Build update data
    const updateData = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    // Add status-specific fields
    if (newStatus === BOOKING_STATUS.CANCELED) {
      updateData.cancelled_at = new Date().toISOString();
      updateData.cancellation_by = isHost ? 'host' : 'renter';
      updateData.cancellation_reason = reason || null;
    }

    if (notes) {
      updateData.notes = notes;
    }

    // Update the booking
    const [updatedBooking] = await sql`
      UPDATE bookings
      SET 
        status = ${updateData.status},
        updated_at = NOW()
        ${updateData.cancelled_at ? sql`, cancelled_at = ${updateData.cancelled_at}` : sql``}
        ${updateData.cancellation_by ? sql`, cancellation_by = ${updateData.cancellation_by}` : sql``}
        ${updateData.cancellation_reason ? sql`, cancellation_reason = ${updateData.cancellation_reason}` : sql``}
        ${updateData.notes ? sql`, notes = COALESCE(notes, '') || E'\n' || ${updateData.notes}` : sql``}
      WHERE id = ${bookingId}
      RETURNING *
    `;

    // Create notification for the other party
    const notifyUserId = isHost ? booking.renter_user_id : booking.host_user_id;
    const notificationMessages = {
      [BOOKING_STATUS.HOST_APPROVED]: 'Your booking request has been approved!',
      [BOOKING_STATUS.DECLINED]: 'Your booking request was declined.',
      [BOOKING_STATUS.PAID]: 'Payment received for booking.',
      [BOOKING_STATUS.IN_PROGRESS]: 'Your rental is now active.',
      [BOOKING_STATUS.COMPLETED]: 'Booking has been marked as complete.',
      [BOOKING_STATUS.CANCELED]: 'Booking has been canceled.',
      [BOOKING_STATUS.DISPUTED]: 'A dispute has been opened for this booking.'
    };

    if (notificationMessages[newStatus]) {
      try {
        await sql`
          INSERT INTO notifications (user_id, type, title, body, booking_id)
          VALUES (
            ${notifyUserId},
            'BOOKING_UPDATE',
            'Booking Status Update',
            ${notificationMessages[newStatus]},
            ${bookingId}
          )
        `;
      } catch (e) {
        console.warn('Failed to create notification:', e);
      }
    }

    // Track analytics
    try {
      await sql`
        INSERT INTO analytics_events (event_type, user_id, booking_id, listing_id, properties)
        VALUES (
          'booking_status_changed',
          ${userId || null},
          ${bookingId},
          ${booking.listing_id},
          ${JSON.stringify({ fromStatus: currentStatus, toStatus: newStatus, reason })}::jsonb
        )
      `;
    } catch (e) {
      // Analytics should fail silently
    }

    return res.status(200).json({
      success: true,
      data: {
        id: updatedBooking.id,
        previousStatus: currentStatus,
        currentStatus: updatedBooking.status,
        updatedAt: updatedBooking.updated_at
      },
      message: `Booking status updated from ${currentStatus} to ${newStatus}`
    });
  } catch (error) {
    console.error('Failed to update booking status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update booking status'
    });
  }
}

// Export status constants for use elsewhere
export { BOOKING_STATUS, BOOKING_TRANSITIONS, canTransitionBooking };
