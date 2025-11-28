import { PrismaClient } from '@prisma/client';
import { validateAuth } from '../../_auth';

const prisma = new PrismaClient();

/**
 * Booking states where address should be revealed (payment confirmed or later)
 * Aligns with src/lib/stateMachines/bookingStateMachine.js shouldMaskAddress()
 * 
 * State Flow: Requested → HostApproved → Paid → InProgress → ReturnedPendingConfirmation → Completed
 * Address is MASKED in: Requested, HostApproved, Canceled
 * Address is REVEALED in: Paid, InProgress, ReturnedPendingConfirmation, Completed
 */
const ADDRESS_REVEAL_STATES = [
  'Paid',
  'PAID',
  'InProgress', 
  'IN_PROGRESS',
  'ReturnedPendingConfirmation',
  'RETURNED_PENDING_CONFIRMATION',
  'Completed',
  'COMPLETED'
];

/**
 * GET /bookings/{id}/location - Get precise address for PAID booking
 * Only shows exact location after payment is confirmed
 * Implements Vendibook's core trust rule: address masking until payment
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const user = await validateAuth(req);
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const { id } = req.query;

    // Fetch booking with listing details
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            ownerId: true,
            preciseAddress: true,
            coordinates: true,
            displayLocation: true,
            title: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'BOOKING_NOT_FOUND',
        code: 404
      });
    }

    // Authorization check: Only renter or host can access booking location
    const isRenter = booking.userId === user.id;
    const isHost = booking.listing.ownerId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isRenter && !isHost && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'You do not have access to this booking location',
        code: 403
      });
    }

    // Check booking state - use 'state' field (new) or 'status' field (legacy)
    const bookingState = booking.state || booking.status;
    
    // Status check: Only PAID or later states reveal location
    // This is Vendibook's core trust rule - address stays masked until payment
    if (!ADDRESS_REVEAL_STATES.includes(bookingState)) {
      return res.status(400).json({
        success: false,
        error: 'PAYMENT_NOT_CONFIRMED',
        message: 'Location is only revealed after payment is confirmed. Complete payment to see the exact address.',
        currentState: bookingState,
        code: 400
      });
    }

    // Log this access for audit trail
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REVEAL_BOOKING_LOCATION',
        resource: 'booking',
        resourceId: booking.id,
        listingId: booking.listingId,
        changes: {
          revealedAt: new Date().toISOString(),
          revealedToRole: isRenter ? 'RENTER' : isHost ? 'HOST' : 'ADMIN',
          bookingState: bookingState,
          paymentConfirmed: true
        }
      }
    });

    // Return precise location details
    return res.json({
      success: true,
      data: {
        listingTitle: booking.listing.title,
        displayLocation: booking.listing.displayLocation,
        preciseAddress: booking.listing.preciseAddress,
        coordinates: booking.listing.coordinates,
        // Additional helpful info
        bookingId: booking.id,
        bookingState: bookingState,
        startDate: booking.startDate,
        endDate: booking.endDate,
        // Host contact (if renter is viewing)
        hostContact: isRenter ? {
          hostId: booking.listing.ownerId,
          message: 'Contact the host if you need assistance with pickup or delivery'
        } : undefined,
        // Access instructions (if available)
        accessInstructions: booking.listing.accessInstructions || null
      },
      message: 'Precise location revealed - payment confirmed',
      revealedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Booking Location GET]', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to retrieve booking location',
      code: 500
    });
  }
}
