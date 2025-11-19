/**
 * GET /api/host/bookings
 * Get all bookings for the host's listings
 */

const { requireAuth } = require('../../auth-service');
const db = require('../../db');

module.exports = async (req, res) => {
  try {
    const user = await requireAuth(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { method } = req;
    const { status, listingId, page = 1, limit = 20 } = req.query;

    // GET - Get host's bookings
    if (method === 'GET') {
      // Get all listings owned by this host
      const listings = await db.host.getByUserId(user.id);
      const listingIds = listings.map(l => l.id);

      // Build filter
      const where = {
        listingId: { in: listingIds }
      };

      if (status) {
        where.status = status;
      }

      if (listingId) {
        where.listingId = listingId;
      }

      // Get bookings with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [bookings, total] = await Promise.all([
        db.prisma.booking.findMany({
          where,
          include: {
            user: { select: { id: true, name: true, email: true } },
            listing: { select: { id: true, title: true } }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit)
        }),
        db.prisma.booking.count({ where })
      ]);

      return res.status(200).json({
        data: bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Host bookings endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
