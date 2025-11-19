/**
 * GET /api/messages/:threadId
 * Get messages in a specific thread
 */

const { requireAuth } = require('../../auth-service');
const db = require('../../db');

module.exports = async (req, res) => {
  try {
    // Check authentication
    const user = await requireAuth(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { method } = req;
    const threadId = req.query.threadId || req.url.split('/').pop();

    // GET - Get thread messages
    if (method === 'GET') {
      // Verify thread exists and user is participant
      const thread = await db.messages.getThread(threadId);
      
      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      if (!thread.participantIds.includes(user.id)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Mark all messages as read for this user
      await db.messages.markThreadAsRead(threadId, user.id);

      return res.status(200).json(thread);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Thread detail endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
