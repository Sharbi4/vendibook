/**
 * GET /api/notifications
 * Get user's notifications
 */

const { requireAuth } = require('../../auth-service');
const db = require('../../db');

module.exports = async (req, res) => {
  try {
    const user = await requireAuth(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { method } = req;
    const { unreadOnly = false, limit = 20 } = req.query;

    // GET - Get notifications
    if (method === 'GET') {
      const notifications = await db.notifications.getByUserId(
        user.id,
        unreadOnly === 'true'
      );

      return res.status(200).json(notifications.slice(0, parseInt(limit)));
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Notifications endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
