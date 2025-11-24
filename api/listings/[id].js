import { sql } from '../../src/api/db.js';
import {
  ensureListingsBootstrap,
  resolveHostColumnName,
  toPublicListing,
} from './shared.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, error: 'Validation failed', message: 'Listing ID is required' });
  }

  try {
    await ensureListingsBootstrap();
    const hostColumnName = await resolveHostColumnName();
    const rows = await sql`
      SELECT * FROM listings WHERE id = ${id} LIMIT 1;
    `;

    if (!rows.length) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    const listing = toPublicListing(rows[0], hostColumnName);
    return res.status(200).json({ success: true, data: listing });
  } catch (error) {
    console.error('Failed to load listing:', error);
    return res.status(500).json({ success: false, error: 'Server error', message: error.message });
  }
}
