import {
  sql,
  bootstrapBookingsTable,
  bootstrapAvailabilityBlocksTable
} from '../../src/api/db.js';
import { extractClerkUserId } from '../_clerk.js';

let bookingsBootstrapPromise;

export function ensureBookingsBootstrap() {
  if (!bookingsBootstrapPromise) {
    bookingsBootstrapPromise = Promise.all([
      bootstrapBookingsTable(),
      bootstrapAvailabilityBlocksTable()
    ]);
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

const VALID_BOOKING_MODES = new Set(['daily', 'daily-with-time', 'hourly', 'package']);

const BOOKING_SELECT = `
  SELECT
    b.id,
    b.listing_id,
    b.renter_user_id,
    b.host_user_id,
    b.start_date,
    b.end_date,
    b.start_datetime,
    b.end_datetime,
    b.booking_mode,
    b.rental_days,
    b.duration_hours,
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
     startDateTime: row.start_datetime,
     endDateTime: row.end_datetime,
     bookingMode: row.booking_mode,
     rentalDays: toNumber(row.rental_days),
     durationHours: toNumber(row.duration_hours),
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

export function normalizeBookingMode(mode, fallback = 'daily-with-time') {
  const value = (mode || fallback || 'daily-with-time').toString().trim().toLowerCase();
  if (!VALID_BOOKING_MODES.has(value)) {
    throw createHttpError(400, `Invalid bookingMode "${mode}"`);
  }
  return value;
}

export async function fetchListingSchedulingConfig(listingId) {
  const [row] = await sql`
    SELECT id, booking_mode, default_start_time, default_end_time
    FROM listings
    WHERE id = ${listingId}
    LIMIT 1;
  `;

  if (!row) {
    throw createHttpError(404, 'Listing not found');
  }

  return {
    id: row.id,
    bookingMode: row.booking_mode || 'daily-with-time',
    defaultStartTime: row.default_start_time || null,
    defaultEndTime: row.default_end_time || null
  };
}

export function calculateRentalDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  const diff = end.getTime() - start.getTime();
  return Math.max(Math.floor(diff / 86400000) + 1, 1);
}

export function calculateDurationHours(startDateTime, endDateTime) {
  if (!startDateTime || !endDateTime) {
    return null;
  }
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  const diff = end.getTime() - start.getTime();
  return Math.max(diff / 3600000, 0);
}

function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

export async function checkBookingConflicts({ listingId, bookingMode, startDate, endDate, startDateTime, endDateTime }) {
  // Blocks always prevent bookings
  const [block] = await sql`
    SELECT id, start_date, end_date
    FROM availability_blocks
    WHERE listing_id = ${listingId}
      AND start_date <= ${endDate}
      AND end_date >= ${startDate}
    LIMIT 1;
  `;

  if (block) {
    return {
      type: 'AVAILABILITY_BLOCK',
      details: {
        blockId: block.id,
        conflictingDates: { start: block.start_date, end: block.end_date }
      }
    };
  }

  // Non-hourly bookings are considered full-day blocks
  const [fullDayBooking] = await sql`
    SELECT id, start_date, end_date
    FROM bookings
    WHERE listing_id = ${listingId}
      AND LOWER(COALESCE(booking_mode, 'daily-with-time')) <> 'hourly'
      AND start_date <= ${endDate}
      AND end_date >= ${startDate}
    LIMIT 1;
  `;

  if (fullDayBooking) {
    return {
      type: 'BOOKING',
      details: {
        conflictingBookingId: fullDayBooking.id,
        conflictingDates: { start: fullDayBooking.start_date, end: fullDayBooking.end_date }
      }
    };
  }

  if (bookingMode !== 'hourly') {
    // An existing hourly booking blocks the day for full-day rentals
    const [hourlyDay] = await sql`
      SELECT id, start_date, end_date
      FROM bookings
      WHERE listing_id = ${listingId}
        AND LOWER(COALESCE(booking_mode, '')) = 'hourly'
        AND start_date <= ${endDate}
        AND end_date >= ${startDate}
      LIMIT 1;
    `;

    if (hourlyDay) {
      return {
        type: 'BOOKING',
        details: {
          conflictingBookingId: hourlyDay.id,
          conflictingDates: { start: hourlyDay.start_date, end: hourlyDay.end_date }
        }
      };
    }

    return null;
  }

  // bookingMode === 'hourly' from here
  const hourlyRows = await sql`
    SELECT id, start_datetime, end_datetime
    FROM bookings
    WHERE listing_id = ${listingId}
      AND LOWER(COALESCE(booking_mode, '')) = 'hourly'
      AND start_date <= ${startDate}
      AND end_date >= ${startDate};
  `;

  if (!hourlyRows.length || !startDateTime || !endDateTime) {
    return null;
  }

  const desiredStart = new Date(startDateTime);
  const desiredEnd = new Date(endDateTime);

  for (const row of hourlyRows) {
    if (!row.start_datetime || !row.end_datetime) {
      continue;
    }
    const existingStart = new Date(row.start_datetime);
    const existingEnd = new Date(row.end_datetime);
    if (rangesOverlap(existingStart, existingEnd, desiredStart, desiredEnd)) {
      return {
        type: 'BOOKING',
        details: {
          conflictingBookingId: row.id,
          conflictingDates: { start: row.start_datetime, end: row.end_datetime }
        }
      };
    }
  }

  return null;
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

export function extractClerkId(req, options = {}) {
  return extractClerkUserId(req, options);
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
