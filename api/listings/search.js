/**
 * POST /api/listings/search - Advanced search with filters
 * 
 * Request body:
 * {
 *   listingType?: RENT | SALE | EVENT_PRO
 *   category?: string
 *   location?: string (city or state)
 *   priceMin?: number
 *   priceMax?: number
 *   verifiedOnly?: boolean
 *   deliveryOnly?: boolean
 *   amenities?: string[] (tags to match)
 *   search?: string (text search)
 *   limit?: number (default 50, max 500)
 * }
 * 
 * Response: 200 OK
 * {
 *   count: number (results returned)
 *   total: number (total matches)
 *   listings: [...]
 * }
 */

const db = require('../_db');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const filters = req.body || {};
    const limit = Math.min(filters.limit || 50, 500); // Max 500 results
    
    // Use the database search method
    const results = db.listings.search(filters);
    
    // Apply limit
    const limitedResults = results.slice(0, limit);
    
    return res.status(200).json({
      count: limitedResults.length,
      total: results.length,
      listings: limitedResults
    });
    
  } catch (error) {
    return res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
}
