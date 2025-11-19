/**
 * PUT /api/host/bookings/:bookingId/status
 * Update booking status (accept/decline/complete/cancel)
 */

const { requireAuth, requireOwnership } = require('../../auth-service');
const db = require('../../db');
const { updateBookingStatusSchema } = require('../../validation');

module.exports = async (req, res) => {
  try {
    const user = await requireAuth(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const bookingId = req.query.bookingId || req.url.split('/')[4];
    const { method } = req;

    // GET - Get booking details
    if (method === 'GET') {
      const booking = await db.bookings.getById(bookingId);
      
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Check ownership
      const listing = await db.host.getById(booking.listingId);
      if (listing.ownerId !== user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      return res.status(200).json(booking);
    }

    // PUT - Update booking status
    if (method === 'PUT') {
      const booking = await db.bookings.getById(bookingId);
      
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Check ownership
      const listing = await db.host.getById(booking.listingId);
      if (listing.ownerId !== user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Validate input
      const validation = updateBookingStatusSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }

      const { status, reason } = validation.data;

      // Update booking status
      const updatedBooking = await db.prisma.booking.update({
        where: { id: bookingId },
        data: {
          status,
          ...(status === 'APPROVED' && { respondedAt: new Date() }),
          ...(status === 'DECLINED' && { respondedAt: new Date() }),
          ...(status === 'COMPLETED' && { completedAt: new Date() })
        }
      });

      // Create audit log
      await db.auditLogs.create(user.id, 'UPDATE_BOOKING', 'booking', bookingId, {
        fromStatus: booking.status,
        toStatus: status,
        reason
      });

      // Create notification for renter
      let notificationType = 'BOOKING_REQUEST';
      let notificationMessage = '';

      if (status === 'APPROVED') {
        notificationType = 'BOOKING_APPROVED';
        notificationMessage = `Your booking for "${listing.title}" has been approved!`;
      } else if (status === 'DECLINED') {
        notificationType = 'BOOKING_DECLINED';
        notificationMessage = `Your booking for "${listing.title}" has been declined.`;
      } else if (status === 'COMPLETED') {
        notificationMessage = `Your booking for "${listing.title}" is now complete.`;
      }

      if (notificationMessage) {
        await db.notifications.create(booking.userId, notificationType, notificationMessage, bookingId);
      }

      return res.status(200).json(updatedBooking);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Booking status endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
