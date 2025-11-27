import { sql, bootstrapListingsTable, bootstrapBookingsTable, bootstrapUsersTable } from '../../src/api/db.js';

async function ensureTablesReady() {
  await Promise.all([bootstrapListingsTable(), bootstrapBookingsTable(), bootstrapUsersTable()]);
}

async function safeMetric(queryPromise, fallbackValue) {
  try {
    const rows = await queryPromise;
    const value = Array.isArray(rows) && rows.length ? rows[0] : null;
    if (!value) return fallbackValue;
    const metric = value.count ?? value.total ?? value.sum ?? value.value ?? fallbackValue;
    const num = typeof metric === 'number' ? metric : Number(metric);
    return Number.isFinite(num) ? num : fallbackValue;
  } catch (error) {
    console.warn('admin summary metric fallback', error.message);
    return fallbackValue;
  }
}

async function buildAdminSummary(rangeDays = 30) {
  await ensureTablesReady();

  const days = Math.max(1, Math.min(Number(rangeDays) || 30, 90));

  const [totalActiveListings, bookingsLastThirty, grossBookingValue, activeVendors] = await Promise.all([
    safeMetric(sql`SELECT COUNT(*)::int AS count FROM listings;`, 0),
    safeMetric(sql`
      SELECT COUNT(*)::int AS count
      FROM bookings
      WHERE created_at >= NOW() - ${days} * INTERVAL '1 day';
    `, 0),
    safeMetric(sql`
      SELECT COALESCE(SUM(total_price), 0)::numeric AS sum
      FROM bookings
      WHERE created_at >= NOW() - ${days} * INTERVAL '1 day';
    `, 0),
    safeMetric(sql`
      SELECT COUNT(*)::int AS count
      FROM users
      WHERE LOWER(role) IN ('host', 'event_pro', 'event-pro', 'vendor');
    `, 0)
  ]);

  return {
    rangeDays: days,
    generatedAt: new Date().toISOString(),
    totals: {
      totalActiveListings,
      bookingsLast30Days: bookingsLastThirty,
      grossBookingValueLast30Days: grossBookingValue,
      activeVendors: activeVendors
    }
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // TODO: Plug in admin authorization check once identity/role middleware is wired up.

  try {
    const summary = await buildAdminSummary(req.query?.range);
    return res.status(200).json({ success: true, data: summary });
  } catch (error) {
    console.error('Failed to load admin summary', error);
    return res.status(500).json({ success: false, error: 'Failed to load admin summary' });
  }
}
