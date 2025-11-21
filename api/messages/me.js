import {
  ensureMessagingBootstrap,
  extractClerkId,
  resolveUserId,
  parsePagination,
  listThreads,
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
    const pagination = parsePagination(req.query || {});
    const roleParam = String(req.query?.role || '').toLowerCase();
    const role = roleParam === 'host' || roleParam === 'renter' ? roleParam : null;

    const clerkId = extractClerkId(req);
    if (!clerkId) {
      throw createHttpError(400, 'Missing clerkId. Provide via x-clerk-id header or query parameter.');
    }

    const userId = await resolveUserId({ clerkId, label: 'current user' });

    const { threads, total } = await listThreads({ userId, role, pagination });

    return res.status(200).json({
      success: true,
      data: threads,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.max(Math.ceil(total / pagination.limit), 1)
      }
    });
  } catch (error) {
    return handleRouteError(res, error, 'Failed to fetch inbox');
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
