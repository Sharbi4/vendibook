/**
 * GET /api/analytics/host/listing/:listingId
 * Get specific listing analytics
 */

const { requireAuth } = require('../../../auth-service');
const analyticsService = require('../../../analytics-service');
const db = require('../../../db');

module.exports = async (req, res) => {
  try {
    const user = await requireAuth(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { method } = req;
    const listingId = req.query.listingId || req.url.split('/').pop();

    // GET - Get listing analytics
    if (method === 'GET') {
      // Verify ownership
      const listing = await db.host.getById(listingId);

      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      if (listing.ownerId !== user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const analytics = await analyticsService.getListingAnalytics(listingId);
      return res.status(200).json(analytics);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Listing analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
