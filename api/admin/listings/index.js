/**
 * GET /api/admin/listings
 * Get all listings with admin controls
 */

const { requireAuth, requireRole } = require('../../auth-service');
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
    const { status, listingType, page = 1, limit = 50 } = req.query;

    // GET - Get all listings
    if (method === 'GET') {
      const where = {};

      if (status) {
        where.status = status;
      }

      if (listingType) {
        where.listingType = listingType;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [listings, total] = await Promise.all([
        db.prisma.hostListing.findMany({
          where,
          include: {
            owner: { select: { id: true, name: true, email: true } }
          },
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        db.prisma.hostListing.count({ where })
      ]);

      return res.status(200).json({
        data: listings,
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
    console.error('Admin listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
