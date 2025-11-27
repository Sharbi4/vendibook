import { sql, bootstrapListingsTable } from '../../../src/api/db.js';
import { getCurrentHostId } from '../../../src/api/auth/hostPlaceholder.js';

const DEFAULT_LIMIT = 6;

const parseLimit = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(parsed, 24);
};

const mapListingRecord = (row) => ({
  id: row.id,
  title: row.title,
  listingType: row.listing_type || row.listingType || 'rental',
  city: row.city || null,
  state: row.state || null,
  price: row.price != null ? Number(row.price) : null,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await bootstrapListingsTable();
  } catch (error) {
    console.error('Failed to bootstrap listings table for dashboard', error);
    return res.status(500).json({ success: false, error: 'Unable to initialize listings' });
  }

  const hostId = getCurrentHostId(req);
  const limit = parseLimit(req.query?.limit);

  try {
    const rows = await sql`
      SELECT
        id,
        title,
        listing_type,
        COALESCE(display_city, city) AS city,
        COALESCE(display_state, state) AS state,
        price,
        created_at,
        updated_at
      FROM listings
      WHERE host_user_id = ${hostId}
      ORDER BY updated_at DESC
      LIMIT ${limit}
    `;
    return res.status(200).json({ success: true, data: rows.map(mapListingRecord) });
  } catch (error) {
    console.warn('Dashboard listings fallback path (TODO attach host_id to listings)', error);
  }

  try {
    const rows = await sql`
      SELECT
        id,
        title,
        listing_type,
        COALESCE(display_city, city) AS city,
        COALESCE(display_state, state) AS state,
        price,
        created_at,
        updated_at
      FROM listings
      ORDER BY updated_at DESC
      LIMIT ${limit}
    `;
    return res.status(200).json({ success: true, data: rows.map(mapListingRecord) });
  } catch (error) {
    console.error('Dashboard listings query failed', error);
    return res.status(500).json({ success: false, error: 'Unable to load listings' });
  }
}
