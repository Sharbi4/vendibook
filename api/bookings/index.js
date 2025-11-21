import { sql } from '../../src/api/db.js';
import {
  ensureBookingsBootstrap,
  fetchBookings,
  fetchBookingById,
  parsePagination,
  parseStatusFilter,
  normalizeStatus,
  resolveUserId,
  extractClerkId,
  createHttpError
} from './shared.js';
// import {
//   notifyBookingCreated,
//   notifyBookingStatusChanged,
//   notifyBookingCancelled
// } from '../../src/api/notifications/hooks.js'; // TODO: enable after notification wiring

const CANCELLATION_ACTORS = new Set(['RENTER', 'HOST', 'SYSTEM']);

export default async function handler(req, res) {
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

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'PATCH') {
    return handlePatch(req, res);
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

async function handlePost(req, res) {
  try {
    const body = req.body || {};
    const listingId = body.listingId || body.listing_id;
    const renterUserIdInput = body.renterUserId || body.renter_user_id;
    const renterClerkId = body.renterClerkId || body.renter_clerk_id || extractClerkId(req);
    const hostUserIdInput = body.hostUserId || body.host_user_id;
    const hostClerkId = body.hostClerkId || body.host_clerk_id;
    const startDate = normalizeDateInput(body.startDate || body.start_date, 'startDate');
    const endDate = normalizeDateInput(body.endDate || body.end_date, 'endDate');
    const totalPrice = parseTotalPrice(body.totalPrice ?? body.total_price);
    const currency = normalizeCurrency(body.currency);
    const status = normalizeStatus(body.status, 'PENDING');
    const notes = normalizeNotes(body.notes);

    if (!listingId) {
      throw createHttpError(400, 'listingId is required');
    }

    if (endDate < startDate) {
      throw createHttpError(400, 'endDate must be on or after startDate');
    }

    await ensureListingExists(listingId);

    const renterUserId = await resolveUserId({ userId: renterUserIdInput, clerkId: renterClerkId, label: 'renter' });
    const hostUserId = await resolveUserId({ userId: hostUserIdInput, clerkId: hostClerkId, label: 'host' });

    if (renterUserId === hostUserId) {
      throw createHttpError(400, 'Host and renter must be different users');
    }

    const [inserted] = await sql`
      INSERT INTO bookings (
        listing_id,
        renter_user_id,
        host_user_id,
        start_date,
        end_date,
        total_price,
        currency,
        status,
        notes
      ) VALUES (
        ${listingId},
        ${renterUserId},
        ${hostUserId},
        ${startDate},
        ${endDate},
        ${totalPrice},
        ${currency},
        ${status},
        ${notes}
      )
      RETURNING id;
    `;

    const booking = await fetchBookingById(inserted.id);

    // TODO: notifyBookingCreated(booking);

    return res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    return handleRouteError(res, error, 'Failed to create booking');
  }
}

async function handleGet(req, res) {
  try {
    const statuses = parseStatusFilter(req.query.status);
    const listingId = req.query.listingId || req.query.listing_id || null;
    const pagination = parsePagination(req.query);

    let renterUserId = req.query.renterUserId || req.query.renter_user_id || null;
    let hostUserId = req.query.hostUserId || req.query.host_user_id || null;
    let userId = req.query.userId || req.query.user_id || null;
    const role = String(req.query.role || '').toLowerCase();
    const clerkId = extractClerkId(req) || req.query.clerkId || req.query.clerk_id || null;

    if (!userId && clerkId) {
      userId = await resolveUserId({ clerkId, label: 'clerkId filter' });
    }

    if (userId) {
      if (role === 'host') {
        hostUserId = hostUserId || userId;
      } else {
        renterUserId = renterUserId || userId;
      }
    }

    const { bookings, total } = await fetchBookings(
      {
        statuses,
        listingId,
        renterUserId,
        hostUserId
      },
      pagination
    );

    return res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.max(Math.ceil(total / pagination.limit), 1)
      }
    });
  } catch (error) {
    return handleRouteError(res, error, 'Failed to fetch bookings');
  }
}

async function handlePatch(req, res) {
  try {
    const body = req.body || {};
    const bookingId = body.id || body.bookingId || body.booking_id;

    if (!bookingId) {
      throw createHttpError(400, 'bookingId is required');
    }

    const setClauses = [];
    const params = [];

    if (body.status) {
      const normalizedStatus = normalizeStatus(body.status);
      setClauses.push(`status = $${params.length + 1}`);
      params.push(normalizedStatus);
    }

    if (body.notes !== undefined) {
      setClauses.push(`notes = $${params.length + 1}`);
      params.push(normalizeNotes(body.notes));
    }

    const cancellationReason = body.cancellationReason ?? body.cancellation_reason;
    if (cancellationReason !== undefined) {
      if (!cancellationReason) {
        throw createHttpError(400, 'cancellationReason cannot be empty');
      }
      setClauses.push(`cancellation_reason = $${params.length + 1}`);
      params.push(cancellationReason);

      const cancellationBy = normalizeCancellationBy(body.cancellationBy || body.cancellation_by);
      setClauses.push(`cancellation_by = $${params.length + 1}`);
      params.push(cancellationBy);

      setClauses.push('cancelled_at = NOW()');

      if (!body.status) {
        setClauses.push(`status = $${params.length + 1}`);
        params.push('CANCELLED');
      }
    }

    if (!setClauses.length) {
      throw createHttpError(400, 'No updatable fields provided');
    }

    setClauses.push('updated_at = NOW()');

    const updateQuery = `UPDATE bookings SET ${setClauses.join(', ')} WHERE id = $${params.length + 1} RETURNING id`;
    const rows = await sql.unsafe(updateQuery, [...params, bookingId]);

    if (!rows.length) {
      throw createHttpError(404, 'Booking not found');
    }

    const booking = await fetchBookingById(rows[0].id);

    // TODO: notifyBookingStatusChanged(booking);
    // if (booking?.status === 'CANCELLED') {
    //   notifyBookingCancelled(booking);
    // }

    return res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    return handleRouteError(res, error, 'Failed to update booking');
  }
}

function normalizeDateInput(value, label) {
  if (!value) {
    throw createHttpError(400, `${label} is required`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, `Invalid ${label}`);
  }

  return date.toISOString().split('T')[0];
}

function parseTotalPrice(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    throw createHttpError(400, 'totalPrice must be a positive number');
  }
  return Math.round(num * 100) / 100;
}

function normalizeCurrency(value) {
  if (!value) {
    return 'USD';
  }

  const currency = String(value).trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw createHttpError(400, 'currency must be a 3-letter ISO code');
  }

  return currency;
}

function normalizeNotes(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const text = String(value).trim();
  return text.length ? text : null;
}

async function ensureListingExists(listingId) {
  const [listing] = await sql`SELECT id FROM listings WHERE id = ${listingId} LIMIT 1`;
  if (!listing) {
    throw createHttpError(404, 'Listing not found');
  }
  return listing.id;
}

function normalizeCancellationBy(value) {
  if (!value) {
    return 'SYSTEM';
  }

  const normalized = String(value).trim().toUpperCase();
  if (!CANCELLATION_ACTORS.has(normalized)) {
    throw createHttpError(400, 'Invalid cancellationBy value');
  }

  return normalized;
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
