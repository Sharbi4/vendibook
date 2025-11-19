/**
 * GET /api/analytics/host/overview
 * Get host overview analytics
 */

const { requireAuth, requireRole } = require('../../auth-service');
const analyticsService = require('../../analytics-service');

module.exports = async (req, res) => {
  try {
    const user = await requireAuth(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { method } = req;

    // GET - Get host overview analytics
    if (method === 'GET') {
      const analytics = await analyticsService.getHostOverview(user.id);
      return res.status(200).json(analytics);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Host overview analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
