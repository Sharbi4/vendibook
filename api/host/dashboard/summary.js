import { sql, bootstrapListingsTable, bootstrapBookingsTable, bootstrapMessageThreadsTable } from '../../../src/api/db.js';
import { getCurrentHostId } from '../../../src/api/auth/hostPlaceholder.js';

async function ensureBootstrap() {
  await Promise.all([
    bootstrapListingsTable(),
    bootstrapBookingsTable(),
    bootstrapMessageThreadsTable()
  ]);
}

const ACTIVE_STATUSES = ['active', 'confirmed', 'accepted', 'in_progress'];
const UPCOMING_STATUSES = ['pending', 'confirmed', 'active', 'accepted'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await ensureBootstrap();
  } catch (error) {
    console.error('Failed to bootstrap dashboard summary tables', error);
    return res.status(500).json({ success: false, error: 'Unable to initialize data sources' });
  }

  const hostId = getCurrentHostId(req);
  const metrics = {
    totalListings: 0,
    activeBookings: 0,
    upcomingBookings: 0,
    unreadMessages: 0
  };

  try {
    const [row] = await sql`
      SELECT COUNT(*)::int AS count
      FROM listings
      WHERE host_user_id = ${hostId}
    `;
    metrics.totalListings = Number(row?.count) || 0;
  } catch (error) {
    console.warn('Dashboard summary listings fallback triggered (TODO host_id on listings)', error);
    metrics.totalListings = 0;
  }

  try {
    const [row] = await sql`
      SELECT COUNT(*)::int AS count
      FROM bookings
      WHERE host_user_id = ${hostId}
        AND status = ANY(${sql.array(ACTIVE_STATUSES, 'text')})
    `;
    metrics.activeBookings = Number(row?.count) || 0;
  } catch (error) {
    console.warn('Dashboard summary active bookings fallback', error);
    metrics.activeBookings = 0;
  }

  try {
    const [row] = await sql`
      SELECT COUNT(*)::int AS count
      FROM bookings
      WHERE host_user_id = ${hostId}
        AND status = ANY(${sql.array(UPCOMING_STATUSES, 'text')})
        AND (start_date >= NOW()::date OR start_datetime >= NOW())
    `;
    metrics.upcomingBookings = Number(row?.count) || 0;
  } catch (error) {
    console.warn('Dashboard summary upcoming bookings fallback', error);
    metrics.upcomingBookings = 0;
  }

  try {
    const [row] = await sql`
      SELECT COALESCE(SUM(host_unread_count), 0)::int AS count
      FROM message_threads
      WHERE host_user_id = ${hostId}
    `;
    metrics.unreadMessages = Number(row?.count) || 0;
  } catch (error) {
    console.warn('Dashboard summary unread messages fallback (TODO messaging integration)', error);
    metrics.unreadMessages = 0;
  }

  return res.status(200).json({ success: true, data: metrics });
}
