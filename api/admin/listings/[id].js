/**
 * PUT /api/admin/listings/:id
 * Moderate listing (suspend, unsuspend, flag)
 */

const { requireAuth } = require('../../../auth-service');
const db = require('../../../db');

module.exports = async (req, res) => {
  try {
    const user = await requireAuth(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // Check admin role
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { method } = req;
    const listingId = req.query.id || req.url.split('/').pop();

    // GET - Get listing details
    if (method === 'GET') {
      const listing = await db.prisma.hostListing.findUnique({
        where: { id: listingId },
        include: {
          owner: true,
          bookings: { select: { id: true, status: true, userId: true } },
          reviews: { select: { id: true, rating: true } }
        }
      });

      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      return res.status(200).json(listing);
    }

    // PUT - Update listing status
    if (method === 'PUT') {
      const { action, reason } = req.body;

      const listing = await db.prisma.hostListing.findUnique({
        where: { id: listingId }
      });

      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      let newStatus = listing.status;
      let auditAction = 'UPDATE_LISTING';

      switch (action) {
        case 'suspend':
          newStatus = 'PAUSED';
          auditAction = 'SUSPEND_LISTING';
          break;
        case 'unsuspend':
          newStatus = 'LIVE';
          auditAction = 'UNSUSPEND_LISTING';
          break;
        case 'delete':
          newStatus = 'ARCHIVED';
          auditAction = 'DELETE_LISTING';
          break;
        case 'publish':
          newStatus = 'LIVE';
          auditAction = 'PUBLISH_LISTING';
          break;
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }

      // Update listing
      const updated = await db.prisma.hostListing.update({
        where: { id: listingId },
        data: {
          status: newStatus,
          updatedAt: new Date()
        }
      });

      // Create audit log
      await db.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: auditAction,
          resource: 'listing',
          resourceId: listingId,
          listingId,
          changes: {
            fromStatus: listing.status,
            toStatus: newStatus,
            reason: reason || 'Admin action'
          }
        }
      });

      // Notify listing owner
      await db.prisma.notification.create({
        data: {
          userId: listing.ownerId,
          type: 'LISTING_FLAGGED',
          title: `Your listing "${listing.title}" was ${action}d`,
          message: reason || 'Your listing has been moderated by an admin.',
          relatedId: listingId
        }
      });

      return res.status(200).json(updated);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin listing detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
