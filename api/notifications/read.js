/**
 * POST /api/notifications/read
 * Mark notifications as read
 */

const { requireAuth } = require('../../auth-service');
const db = require('../../db');

module.exports = async (req, res) => {
  try {
    const user = await requireAuth(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { method } = req;

    // POST - Mark as read
    if (method === 'POST') {
      const { notificationIds, markAllAsRead = false } = req.body;

      if (markAllAsRead) {
        // Mark all notifications as read for user
        await db.prisma.notification.updateMany({
          where: {
            userId: user.id,
            read: false
          },
          data: {
            read: true,
            readAt: new Date()
          }
        });

        return res.status(200).json({ success: true, message: 'All notifications marked as read' });
      }

      if (!notificationIds || !Array.isArray(notificationIds)) {
        return res.status(400).json({ error: 'notificationIds array required' });
      }

      // Mark specific notifications as read
      const results = await Promise.all(
        notificationIds.map(id => db.notifications.markAsRead(id))
      );

      return res.status(200).json({ success: true, marked: results.length });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Mark read endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
