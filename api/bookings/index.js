/**
 * GET /api/bookings
 * Get all bookings for the logged-in renter
 */

const { requireAuth } = require('../../auth-service');
const db = require('../../db');

module.exports = async (req, res) => {
  try {
    const user = await requireAuth(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { method } = req;
    const { status, page = 1, limit = 20 } = req.query;

    // GET - Get user's bookings
    if (method === 'GET') {
      const where = { userId: user.id };

      if (status) {
        where.status = status;
      }

      // Get bookings with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [bookings, total] = await Promise.all([
        db.prisma.booking.findMany({
          where,
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
                location: true,
                price: true,
                priceUnit: true,
                hostName: true
              }
            }
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
    console.error('Bookings endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
