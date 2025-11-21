import {
  ensureNotificationsBootstrap,
  listNotifications,
  markAllNotificationsRead,
  extractClerkId,
  resolveUserId,
  parsePagination,
  createHttpError
} from '../../src/api/notifications/shared.js';

export default async function handler(req, res) {
  try {
    await ensureNotificationsBootstrap();
  } catch (error) {
    console.error('Failed to bootstrap notifications subsystem:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to initialize notifications subsystem'
    });
  }

  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'PATCH') {
    return handlePatch(req, res);
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

async function handleGet(req, res) {
  try {
    const clerkId = extractClerkId(req);
    if (!clerkId) {
      throw createHttpError(400, 'Missing clerkId. Provide via x-clerk-id header or query parameter.');
    }

    const userId = await resolveUserId({ clerkId, label: 'current user' });
    const pagination = parsePagination(req.query || {});
    const filters = {
      userId,
      type: req.query?.type || null,
      isRead: parseBoolean(req.query?.is_read ?? req.query?.isRead)
    };

    const { notifications, total } = await listNotifications(filters, pagination);

    return res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.max(Math.ceil(total / pagination.limit), 1)
      }
    });
  } catch (error) {
    return handleRouteError(res, error, 'Failed to fetch notifications');
  }
}

async function handlePatch(req, res) {
  try {
    const clerkId = extractClerkId(req);
    if (!clerkId) {
      throw createHttpError(400, 'Missing clerkId. Provide via x-clerk-id header or query parameter.');
    }
    const userId = await resolveUserId({ clerkId, label: 'current user' });
    const updatedCount = await markAllNotificationsRead(userId);

    return res.status(200).json({
      success: true,
      updated: updatedCount
    });
  } catch (error) {
    return handleRouteError(res, error, 'Failed to mark notifications as read');
  }
}

function parseBoolean(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  const normalized = String(value).toLowerCase();
  if (['true', '1', 'yes'].includes(normalized)) {
    return true;
  }
  if (['false', '0', 'no'].includes(normalized)) {
    return false;
  }
  return undefined;
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
