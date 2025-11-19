/**
 * GET /api/listings - Get all listings with filters
 * 
 * Query parameters:
 * - listingType: RENT | SALE | EVENT_PRO
 * - category: food-trucks, trailers, ghost-kitchens, etc.
 * - location: city or state name
 * - priceMin: minimum price
 * - priceMax: maximum price
 * - verifiedOnly: true to show only verified vendors
 * - deliveryOnly: true to show only delivery-available items
 * - search: text search in title and description
 * - limit: max number of results (default 50)
 * 
 * Response: 200 OK
 * {
 *   count: number
 *   listings: [...] (array of listing objects)
 * }
 */

const db = require('../_db');

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const {
    listingType,
    category,
    location,
    priceMin,
    priceMax,
    verifiedOnly,
    deliveryOnly,
    search,
    limit = '50'
  } = req.query;
  
  try {
    // Build filters object
    const filters = {};
    
    if (listingType) filters.listingType = listingType;
    if (category) filters.category = category;
    if (location) filters.location = location;
    if (priceMin) filters.priceMin = priceMin;
    if (priceMax) filters.priceMax = priceMax;
    if (verifiedOnly === 'true') filters.verifiedOnly = true;
    if (deliveryOnly === 'true') filters.deliveryOnly = true;
    if (search) filters.search = search;
    
    // Execute search
    const results = db.listings.search(filters);
    
    // Apply limit
    const maxLimit = parseInt(limit) || 50;
    const limitedResults = results.slice(0, Math.min(maxLimit, 500));
    
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
