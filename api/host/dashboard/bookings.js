import { sql, bootstrapBookingsTable, bootstrapListingsTable } from '../../../src/api/db.js';
import { getCurrentHostId } from '../../../src/api/auth/hostPlaceholder.js';

const DEFAULT_LIMIT = 6;

const parseLimit = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(parsed, 20);
};

const mapBookingRecord = (row) => ({
  id: row.id,
  status: row.status,
  startDate: row.start_date,
  endDate: row.end_date,
  startDatetime: row.start_datetime,
  endDatetime: row.end_datetime,
  totalPrice: row.total_price != null ? Number(row.total_price) : null,
  currency: row.currency || 'USD',
  listingTitle: row.listing_title,
  city: row.city || null,
  state: row.state || null
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await Promise.all([bootstrapBookingsTable(), bootstrapListingsTable()]);
  } catch (error) {
    console.error('Failed to bootstrap bookings tables for dashboard', error);
    return res.status(500).json({ success: false, error: 'Unable to initialize bookings' });
  }

  const hostId = getCurrentHostId(req);
  const limit = parseLimit(req.query?.limit);

  try {
    const rows = await sql`
      SELECT
        b.id,
        b.status,
        b.start_date,
        b.end_date,
        b.start_datetime,
        b.end_datetime,
        b.total_price,
        b.currency,
        COALESCE(b.event_city, l.display_city, l.city) AS city,
        COALESCE(b.event_state, l.display_state, l.state) AS state,
        l.title AS listing_title
      FROM bookings b
      LEFT JOIN listings l ON l.id = b.listing_id
      WHERE b.host_user_id = ${hostId}
      ORDER BY COALESCE(b.start_datetime, b.start_date::timestamp, b.created_at) DESC
      LIMIT ${limit}
    `;

    return res.status(200).json({ success: true, data: rows.map(mapBookingRecord) });
  } catch (error) {
    console.warn('Dashboard bookings fallback (TODO host filters)', error);
    return res.status(200).json({ success: true, data: [] });
  }
}
