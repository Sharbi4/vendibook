/**
 * GET /api/messages/threads
 * Get all message threads for logged-in user
 */

const { requireAuth } = require('../../auth-service');
const db = require('../../db');

module.exports = async (req, res) => {
  try {
    // Check authentication
    const user = await requireAuth(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { method } = req;

    // GET - Get user's message threads
    if (method === 'GET') {
      const threads = await db.messages.getThreads(user.id);

      // Format response with unread count
      const threadsWithUnread = threads.map(thread => {
        const unreadCount = thread.messages.filter(
          m => !m.readStatus && m.recipientId === user.id
        ).length;
        
        return {
          ...thread,
          unreadCount,
          lastMessage: thread.messages[0] || null
        };
      });

      return res.status(200).json(threadsWithUnread);
    }

    // POST - Create new message thread
    if (method === 'POST') {
      const { recipientId, listingId, subject } = req.body;

      // Validate recipient exists
      const recipient = await db.users.getById(recipientId);
      if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found' });
      }

      // Check if thread already exists between these users
      const existingThreads = await db.messages.getThreads(user.id);
      const existingThread = existingThreads.find(
        t => t.participantIds.length === 2 && 
            t.participantIds.includes(recipientId) &&
            t.listingId === listingId
      );

      if (existingThread) {
        return res.status(200).json(existingThread);
      }

      // Create new thread
      const thread = await db.messages.createThread(
        [user.id, recipientId],
        listingId,
        subject
      );

      return res.status(201).json(thread);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Threads endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
