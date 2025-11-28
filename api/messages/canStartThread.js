import { sql, bootstrapBookingsTable, bootstrapMessageThreadsTable, bootstrapUsersTable } from '../../src/api/db.js';

/**
 * GET /api/messages/canStartThread
 * 
 * Checks if a user can start a message thread with a host for a specific listing.
 * 
 * Query params:
 *   - listingId: The listing to check messaging eligibility for
 *   - userId or renterId: The user attempting to message (optional if using Clerk auth)
 * 
 * Returns:
 *   - allowed: boolean - Whether messaging is permitted
 *   - reason: string - Explanation if not allowed
 *   - threadId: string - Existing thread ID if one exists (when allowed)
 *   - booking: object - The confirmed booking details (when allowed)
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // Bootstrap tables
    await Promise.all([
      bootstrapUsersTable(),
      bootstrapBookingsTable(),
      bootstrapMessageThreadsTable()
    ]);

    const listingId = req.query.listingId || req.query.listing_id;
    if (!listingId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_LISTING',
        message: 'listingId is required',
        allowed: false,
        reason: 'No listing specified'
      });
    }

    // Get user ID from various sources
    let renterId = req.query.userId || req.query.user_id || req.query.renterId || req.query.renter_id;
    const clerkId = req.headers['x-clerk-id'] || req.query.clerkId || req.query.clerk_id;

    // If no direct user ID but have Clerk ID, resolve it
    if (!renterId && clerkId) {
      const [user] = await sql`
        SELECT id FROM users WHERE clerk_id = ${clerkId} LIMIT 1
      `;
      if (user) {
        renterId = user.id;
      }
    }

    // If still no user, they need to login
    if (!renterId) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_REQUIRED',
        message: 'Authentication required to check messaging eligibility',
        allowed: false,
        reason: 'not_authenticated'
      });
    }

    // Get listing info to find the host
    const [listing] = await sql`
      SELECT id, host_user_id, title 
      FROM listings 
      WHERE id = ${listingId} 
      LIMIT 1
    `;

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'LISTING_NOT_FOUND',
        message: 'Listing not found',
        allowed: false,
        reason: 'listing_not_found'
      });
    }

    const hostUserId = listing.host_user_id;

    // Don't allow messaging yourself
    if (renterId === hostUserId) {
      return res.status(400).json({
        success: false,
        error: 'SELF_MESSAGE',
        message: 'You cannot message yourself',
        allowed: false,
        reason: 'self_message'
      });
    }

    // Check for a confirmed/paid booking for this listing by this renter
    const [booking] = await sql`
      SELECT id, status, start_date, end_date, total_price
      FROM bookings
      WHERE listing_id = ${listingId}
        AND renter_user_id = ${renterId}
        AND status IN ('CONFIRMED', 'PAID', 'COMPLETED')
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (!booking) {
      return res.status(200).json({
        success: true,
        allowed: false,
        reason: 'no_booking',
        message: 'A confirmed booking is required before you can message this host. Please complete a booking first.',
        listingId,
        listingTitle: listing.title
      });
    }

    // User has a confirmed booking - check if thread exists
    const [existingThread] = await sql`
      SELECT id 
      FROM message_threads
      WHERE host_user_id = ${hostUserId}
        AND renter_user_id = ${renterId}
        AND (booking_id = ${booking.id} OR booking_id IS NULL)
      ORDER BY 
        CASE WHEN booking_id = ${booking.id} THEN 0 ELSE 1 END,
        created_at DESC
      LIMIT 1
    `;

    if (existingThread) {
      return res.status(200).json({
        success: true,
        allowed: true,
        reason: 'existing_thread',
        threadId: existingThread.id,
        booking: {
          id: booking.id,
          status: booking.status,
          startDate: booking.start_date,
          endDate: booking.end_date
        },
        listingId,
        listingTitle: listing.title
      });
    }

    // No thread exists, create one
    const [newThread] = await sql`
      INSERT INTO message_threads (
        booking_id,
        host_user_id,
        renter_user_id
      ) VALUES (
        ${booking.id},
        ${hostUserId},
        ${renterId}
      )
      RETURNING id
    `;

    return res.status(200).json({
      success: true,
      allowed: true,
      reason: 'new_thread_created',
      threadId: newThread.id,
      booking: {
        id: booking.id,
        status: booking.status,
        startDate: booking.start_date,
        endDate: booking.end_date
      },
      listingId,
      listingTitle: listing.title
    });

  } catch (error) {
    console.error('canStartThread error:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to check messaging eligibility',
      allowed: false,
      reason: 'server_error'
    });
  }
}
