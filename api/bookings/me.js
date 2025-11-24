import {
  ensureBookingsBootstrap,
  fetchBookings,
  parsePagination,
  parseStatusFilter,
  extractClerkId,
  resolveUserId,
  createHttpError
} from './shared.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await ensureBookingsBootstrap();
  } catch (error) {
    console.error('Failed to initialize bookings table:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to initialize bookings subsystem'
    });
  }

  try {
    const clerkId = extractClerkId(req);
    if (!clerkId) {
      throw createHttpError(400, 'Missing clerkId. Provide via x-clerk-id header or query parameter.');
    }

    const roleParam = String(req.query.role || '').toLowerCase();
    const role = roleParam === 'host' ? 'host' : 'renter';
    const statuses = parseStatusFilter(req.query.status);
    const pagination = parsePagination(req.query);
    const userId = await resolveUserId({ clerkId, label: 'current user' });

    const filters = { statuses };
    if (role === 'host') {
      filters.hostUserId = userId;
    } else {
      filters.renterUserId = userId;
    }

    const { bookings, total } = await fetchBookings(filters, pagination);

    return res.status(200).json({
      success: true,
      data: bookings,
      role,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.max(Math.ceil(total / pagination.limit), 1)
      }
    });
  } catch (error) {
    return handleRouteError(res, error, 'Failed to fetch user bookings');
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
