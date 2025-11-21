import { sql, bootstrapBookingsTable } from '../../src/api/db.js';

let bookingsBootstrapPromise;

export function ensureBookingsBootstrap() {
  if (!bookingsBootstrapPromise) {
    bookingsBootstrapPromise = bootstrapBookingsTable();
  }
  return bookingsBootstrapPromise;
}

export function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export const VALID_BOOKING_STATUSES = new Set([
  'PENDING',
  'APPROVED',
  'DECLINED',
  'COMPLETED',
  'CANCELLED'
]);

const BOOKING_SELECT = `
  SELECT
    b.id,
    b.listing_id,
    b.renter_user_id,
    b.host_user_id,
    b.start_date,
    b.end_date,
    b.total_price,
    b.currency,
    b.status,
    b.notes,
    b.cancellation_reason,
    b.cancellation_by,
    b.cancelled_at,
    b.created_at,
    b.updated_at,
    l.title AS listing_title,
    l.description AS listing_description,
    l.city AS listing_city,
    l.state AS listing_state,
    l.price AS listing_price,
    l.listing_type AS listing_type,
    renter.display_name AS renter_display_name,
    renter.email AS renter_email,
    renter.first_name AS renter_first_name,
    renter.last_name AS renter_last_name,
    renter.role AS renter_role,
    host.display_name AS host_display_name,
    host.email AS host_email,
    host.first_name AS host_first_name,
    host.last_name AS host_last_name,
    host.role AS host_role
  FROM bookings b
  JOIN listings l ON l.id = b.listing_id
  JOIN users renter ON renter.id = b.renter_user_id
  JOIN users host ON host.id = b.host_user_id
`;

function toNumber(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatBookingRow(row = {}) {
  const listing = row.listing_id
    ? {
        id: row.listing_id,
        title: row.listing_title || null,
        description: row.listing_description || null,
        city: row.listing_city || null,
        state: row.listing_state || null,
        price: toNumber(row.listing_price),
        listingType: row.listing_type || null
      }
    : null;

  const renter = row.renter_user_id
    ? {
        id: row.renter_user_id,
        displayName: row.renter_display_name || null,
        firstName: row.renter_first_name || null,
        lastName: row.renter_last_name || null,
        email: row.renter_email || null,
        role: row.renter_role || null
      }
    : null;

  const host = row.host_user_id
    ? {
        id: row.host_user_id,
        displayName: row.host_display_name || null,
        firstName: row.host_first_name || null,
        lastName: row.host_last_name || null,
        email: row.host_email || null,
        role: row.host_role || null
      }
    : null;

  return {
    id: row.id,
    listingId: row.listing_id,
    renterUserId: row.renter_user_id,
    hostUserId: row.host_user_id,
    startDate: row.start_date,
    endDate: row.end_date,
    totalPrice: toNumber(row.total_price),
    currency: row.currency,
    status: row.status ? row.status.toUpperCase() : 'PENDING',
    notes: row.notes,
    cancellationReason: row.cancellation_reason,
    cancellationBy: row.cancellation_by,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    listing,
    renter,
    host
  };
}

function buildWhereClause(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.statuses?.length) {
    conditions.push(`b.status = ANY($${params.length + 1})`);
    params.push(filters.statuses);
  }

  if (filters.listingId) {
    conditions.push(`b.listing_id = $${params.length + 1}`);
    params.push(filters.listingId);
  }

  if (filters.renterUserId) {
    conditions.push(`b.renter_user_id = $${params.length + 1}`);
    params.push(filters.renterUserId);
  }

  if (filters.hostUserId) {
    conditions.push(`b.host_user_id = $${params.length + 1}`);
    params.push(filters.hostUserId);
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  };
}

export async function fetchBookings(filters = {}, pagination = { limit: 20, offset: 0 }) {
  const { whereClause, params } = buildWhereClause(filters);
  const limitPlaceholder = `$${params.length + 1}`;
  const offsetPlaceholder = `$${params.length + 2}`;
  const query = `${BOOKING_SELECT}
    ${whereClause}
    ORDER BY b.created_at DESC
    LIMIT ${limitPlaceholder}
    OFFSET ${offsetPlaceholder}`;

  const rows = await sql.unsafe(query, [...params, pagination.limit, pagination.offset]);
  const formatted = rows.map(formatBookingRow);

  const countQuery = `SELECT COUNT(*)::int AS total FROM bookings b ${whereClause}`;
  const [{ total = 0 } = {}] = await sql.unsafe(countQuery, params);

  return {
    bookings: formatted,
    total
  };
}

export async function fetchBookingById(id) {
  if (!id) {
    return null;
  }

  const rows = await sql.unsafe(`${BOOKING_SELECT} WHERE b.id = $1 LIMIT 1`, [id]);
  if (!rows.length) {
    return null;
  }

  return formatBookingRow(rows[0]);
}

export function normalizeStatus(status, fallback = 'PENDING') {
  if (!status) {
    return fallback;
  }

  const normalized = String(status).trim().toUpperCase();
  if (!VALID_BOOKING_STATUSES.has(normalized)) {
    throw createHttpError(400, `Invalid status "${status}"`);
  }
  return normalized;
}

export function parseStatusFilter(value) {
  if (!value) {
    return [];
  }

  const rawValues = Array.isArray(value) ? value : String(value).split(',');
  const statuses = rawValues
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      const upper = part.toUpperCase();
      if (!VALID_BOOKING_STATUSES.has(upper)) {
        throw createHttpError(400, `Invalid status "${part}"`);
      }
      return upper;
    });

  return Array.from(new Set(statuses));
}

export function parsePagination(query = {}) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  return {
    page,
    limit,
    offset: (page - 1) * limit
  };
}

export function extractClerkId(req) {
  const headers = req?.headers || {};
  return (
    headers['x-clerk-id'] ||
    headers['x-clerkid'] ||
    headers['clerk-id'] ||
    headers['clerkid'] ||
    req.body?.clerkId ||
    req.body?.clerk_id ||
    req.query?.clerkId ||
    req.query?.clerk_id ||
    null
  );
}

export async function resolveUserId({ userId, clerkId, label = 'user', required = true }) {
  if (userId) {
    return userId;
  }

  if (!clerkId) {
    if (required) {
      throw createHttpError(400, `Missing ${label} identifier`);
    }
    return null;
  }

  const [record] = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId} LIMIT 1`;
  if (!record) {
    throw createHttpError(404, `User not found for ${label}`);
  }

  return record.id;
}
