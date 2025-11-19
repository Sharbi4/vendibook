/**
 * POST /api/messages
 * Create a new message within a thread
 * 
 * Body: { threadId, recipientId, content }
 */

const { getCurrentUser, requireAuth } = require('../auth-service');
const db = require('../db');
const { createMessageSchema } = require('../validation');

module.exports = async (req, res) => {
  try {
    // Check authentication
    const user = await requireAuth(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { method } = req;

    // POST - Create new message
    if (method === 'POST') {
      const { threadId, recipientId, content } = req.body;

      // Validate input
      const validation = createMessageSchema.safeParse({
        threadId,
        recipientId,
        content
      });

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }

      // Verify thread exists and user is participant
      const thread = await db.prisma.messageThread.findUnique({
        where: { id: threadId }
      });

      if (!thread || !thread.participantIds.includes(user.id)) {
        return res.status(403).json({ error: 'Access denied to this thread' });
      }

      // Verify recipient is in thread
      if (!thread.participantIds.includes(recipientId)) {
        return res.status(400).json({ error: 'Recipient not in thread' });
      }

      // Create message
      const message = await db.messages.createMessage(
        threadId,
        user.id,
        recipientId,
        content
      );

      // Create notification for recipient
      await db.prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'MESSAGE_RECEIVED',
          title: `New message from ${user.name}`,
          message: content.substring(0, 100),
          relatedId: threadId
        }
      });

      return res.status(201).json(message);
    }

    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Messages endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
