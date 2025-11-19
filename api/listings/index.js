/**
 * GET /api/listings
 *
 * Returns all listings with optional filtering
 * Query parameters:
 * - type: RENT | SALE | EVENT_PRO
 * - category: string
 * - location: string
 */

const db = require('../_db');

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, category, location } = req.query;

    // Build filters object
    const filters = {};
    if (type) filters.listingType = type;
    if (category) filters.category = category;
    if (location) filters.location = location;

    // If no filters, return all listings
    if (Object.keys(filters).length === 0) {
      const allListings = db.listings.getAll();
      return res.status(200).json(allListings);
    }

    // Apply filters
    const filteredListings = db.listings.search(filters);
    return res.status(200).json(filteredListings);

  } catch (error) {
    console.error('Error fetching listings:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch listings'
    });
  }
}
