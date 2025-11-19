/**
 * GET /api/admin/bookings
 * Get all bookings for admin
 */

const { requireAuth } = require('../../auth-service');
const db = require('../../db');

module.exports = async (req, res) => {
  try {
    const user = await requireAuth(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // Check admin role
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { method } = req;
    const { status, page = 1, limit = 50 } = req.query;

    // GET - Get all bookings
    if (method === 'GET') {
      const where = {};

      if (status) {
        where.status = status;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [bookings, total] = await Promise.all([
        db.prisma.booking.findMany({
          where,
          include: {
            user: { select: { id: true, name: true, email: true } },
            listing: { select: { id: true, title: true } }
          },
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
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
    console.error('Admin bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
