import {
  sql,
  bootstrapAvailabilityBlocksTable,
  bootstrapListingBookingRulesTable,
  bootstrapBookingsTable,
  bootstrapListingsTable
} from '../db.js';

const DEFAULT_RULES = {
  minDaysNotice: 0,
  maxFutureDays: 365,
  minRentalDays: 1,
  maxRentalDays: 30,
  bookingMode: 'daily-with-time'
};

let availabilityBootstrapPromise;

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export function ensureAvailabilityBootstrap() {
  if (!availabilityBootstrapPromise) {
    availabilityBootstrapPromise = Promise.all([
      bootstrapListingsTable(),
      bootstrapBookingsTable(),
      bootstrapAvailabilityBlocksTable(),
      bootstrapListingBookingRulesTable()
    ]);
  }

  return availabilityBootstrapPromise;
}

function toISODate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().split('T')[0];
}

function enumerateDates(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates = [];
  for (let dt = new Date(start); dt <= end; dt.setUTCDate(dt.getUTCDate() + 1)) {
    dates.push(dt.toISOString().split('T')[0]);
  }
  return dates;
}

export async function getListingRules(listingId) {
  await ensureAvailabilityBootstrap();

  const [row] = await sql`
    SELECT
      l.id,
      l.booking_mode,
      l.default_start_time,
      l.default_end_time,
      r.min_days_notice,
      r.max_future_days,
      r.min_rental_days,
      r.max_rental_days
    FROM listings l
    LEFT JOIN listing_booking_rules r ON r.listing_id = l.id
    WHERE l.id = ${listingId}
    LIMIT 1;
  `;

  if (!row) {
    throw createHttpError(404, 'Listing not found');
  }

  return {
    minDaysNotice: row.min_days_notice ?? DEFAULT_RULES.minDaysNotice,
    maxFutureDays: row.max_future_days ?? DEFAULT_RULES.maxFutureDays,
    minRentalDays: row.min_rental_days ?? DEFAULT_RULES.minRentalDays,
    maxRentalDays: row.max_rental_days ?? DEFAULT_RULES.maxRentalDays,
    bookingMode: row.booking_mode || DEFAULT_RULES.bookingMode,
    defaultStartTime: row.default_start_time || null,
    defaultEndTime: row.default_end_time || null
  };
}

export async function getExistingBookingsForRange(listingId, startDate, endDate) {
  await ensureAvailabilityBootstrap();

  const rows = await sql`
    SELECT
      id,
      start_date,
      end_date,
      start_datetime,
      end_datetime,
      booking_mode
    FROM bookings
    WHERE listing_id = ${listingId}
      AND (
        (start_date IS NOT NULL AND end_date IS NOT NULL AND start_date <= ${endDate} AND end_date >= ${startDate})
        OR (
          start_datetime IS NOT NULL
          AND end_datetime IS NOT NULL
          AND start_datetime::date <= ${endDate}
          AND end_datetime::date >= ${startDate}
        )
      );
  `;

  return rows;
}

export async function getAvailabilityBlocksForRange(listingId, startDate, endDate) {
  await ensureAvailabilityBootstrap();

  const rows = await sql`
    SELECT id, start_date, end_date, reason
    FROM availability_blocks
    WHERE listing_id = ${listingId}
      AND start_date <= ${endDate}
      AND end_date >= ${startDate};
  `;

  return rows;
}

function normalizeDateInput(value, fallback) {
  if (value) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  }
  return fallback;
}

export async function computeUnavailableDates(listingId, startDate, endDate) {
  await ensureAvailabilityBootstrap();
  const bookings = await getExistingBookingsForRange(listingId, startDate, endDate);
  const blocks = await getAvailabilityBlocksForRange(listingId, startDate, endDate);
  const unavailable = new Set();

  bookings.forEach(booking => {
    const mode = (booking.booking_mode || DEFAULT_RULES.bookingMode).toLowerCase();
    const start = toISODate(booking.start_date) || toISODate(booking.start_datetime);
    const end = toISODate(booking.end_date) || toISODate(booking.end_datetime);
    if (!start || !end) {
      return;
    }

    if (mode === 'hourly') {
      // Conservative: block the full date
      unavailable.add(start);
    } else {
      enumerateDates(start, end).forEach(date => unavailable.add(date));
    }
  });

  blocks.forEach(block => {
    const start = toISODate(block.start_date);
    const end = toISODate(block.end_date);
    if (start && end) {
      enumerateDates(start, end).forEach(date => unavailable.add(date));
    }
  });

  return Array.from(unavailable).sort();
}

export async function createAvailabilityBlock({ listingId, startDate, endDate, reason }) {
  await ensureAvailabilityBootstrap();
  const [row] = await sql`
    INSERT INTO availability_blocks (listing_id, start_date, end_date, reason)
    VALUES (${listingId}, ${startDate}, ${endDate}, ${reason || null})
    RETURNING id, listing_id, start_date, end_date, reason, created_at, updated_at;
  `;
  return row;
}

export function resolveDateRange(queryStart, queryEnd) {
  const now = new Date();
  const firstOfThisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const lastOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 0));

  const startDate = normalizeDateInput(queryStart, firstOfThisMonth.toISOString().split('T')[0]);
  const endDate = normalizeDateInput(queryEnd, lastOfNextMonth.toISOString().split('T')[0]);

  if (new Date(startDate) > new Date(endDate)) {
    throw createHttpError(400, 'startDate must be on or before endDate');
  }

  return { startDate, endDate };
}

export { DEFAULT_RULES };
