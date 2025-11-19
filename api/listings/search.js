/**
 * POST /api/listings/search
 *
 * Advanced search with full filter support
 * Body: {
 *   listingType, location, category, startDate, endDate,
 *   priceMin, priceMax, amenities, deliveryOnly, verifiedOnly
 * }
 */

const db = require('../_db');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filters = req.body || {};

    // Parse amenities if it's a comma-separated string
    if (filters.amenities && typeof filters.amenities === 'string') {
      filters.amenities = filters.amenities.split(',').map(a => a.trim());
    }

    // Convert boolean strings
    if (filters.deliveryOnly === 'true') filters.deliveryOnly = true;
    if (filters.deliveryOnly === 'false') filters.deliveryOnly = false;
    if (filters.verifiedOnly === 'true') filters.verifiedOnly = true;
    if (filters.verifiedOnly === 'false') filters.verifiedOnly = false;

    // Search using filter logic
    const results = db.listings.search(filters);

    return res.status(200).json({
      results,
      count: results.length,
      filters: filters
    });

  } catch (error) {
    console.error('Error searching listings:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to search listings'
    });
  }
}
