import {
  ensureMessagingBootstrap,
  extractClerkId,
  resolveUserId,
  parsePagination,
  fetchThreadById,
  fetchMessagesForThread,
  markThreadAsRead,
  createHttpError
} from '../../src/api/messaging/shared.js';

export default async function handler(req, res) {
  try {
    await ensureMessagingBootstrap();
  } catch (error) {
    console.error('Failed to initialize messaging subsystem:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to initialize messaging subsystem'
    });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const threadId = req.query?.threadId || req.query?.thread_id;
    if (!threadId) {
      throw createHttpError(400, 'threadId is required');
    }

    const pagination = parsePagination(req.query || {});
    const markReadParam = String(req.query?.markRead || req.query?.mark_read || 'false').toLowerCase();
    const shouldMarkRead = ['true', '1', 'yes'].includes(markReadParam);

    let currentUserId = req.query?.userId || req.query?.user_id || null;
    const clerkId = extractClerkId(req);
    if (!currentUserId) {
      currentUserId = await resolveUserId({ clerkId, label: 'current user' });
    }

    const thread = await fetchThreadById(threadId);
    if (!thread) {
      throw createHttpError(404, 'Thread not found');
    }

    if (currentUserId !== thread.hostUserId && currentUserId !== thread.renterUserId) {
      throw createHttpError(403, 'Access denied for this thread');
    }

    const { messages, total } = await fetchMessagesForThread(threadId, pagination, 'ASC');

    const responseThread = shouldMarkRead
      ? await markThreadAsRead(thread, currentUserId)
      : thread;

    return res.status(200).json({
      success: true,
      data: {
        thread: responseThread,
        messages
      },
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.max(Math.ceil(total / pagination.limit), 1)
      }
    });
  } catch (error) {
    return handleRouteError(res, error, 'Failed to fetch thread messages');
  }
}

function handleRouteError(res, error, fallbackMessage) {
  if (error?.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: fallbackMessage,
      message: error.message
    });
  }

  console.error(fallbackMessage, error);
  return res.status(500).json({
    success: false,
    error: 'Server error',
    message: fallbackMessage
  });
}
