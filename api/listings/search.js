/**
 * POST /api/listings/search - Advanced search with complex filters
 * 
 * Request body:
 * {
 *   listingType: "RENT" | "SALE" | "EVENT_PRO"
 *   category: string
 *   location: string (city or state)
 *   priceMin: number
 *   priceMax: number
 *   verifiedOnly: boolean
 *   deliveryOnly: boolean
 *   amenities: string[] (at least one match)
 *   search: string (text search in title/description)
 *   limit: number (default 50, max 500)
 * }
 * 
 * Response: 200 OK
 * {
 *   count: number
 *   total: number
 *   listings: [...]
 * }
 */

const db = require('../_db');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const body = req.body || {};
    const {
      listingType,
      category,
      location,
      priceMin,
      priceMax,
      verifiedOnly,
      deliveryOnly,
      amenities,
      search,
      limit = 50
    } = body;
    
    // Build filters object
    const filters = {};
    
    if (listingType) filters.listingType = listingType;
    if (category) filters.category = category;
    if (location) filters.location = location;
    if (priceMin !== undefined && priceMin !== null) filters.priceMin = priceMin;
    if (priceMax !== undefined && priceMax !== null) filters.priceMax = priceMax;
    if (verifiedOnly) filters.verifiedOnly = true;
    if (deliveryOnly) filters.deliveryOnly = true;
    if (amenities && Array.isArray(amenities)) filters.amenities = amenities;
    if (search) filters.search = search;
    
    // Execute search
    const results = db.listings.search(filters);
    
    // Apply limit
    const maxLimit = parseInt(limit) || 50;
    const limitedResults = results.slice(0, Math.min(maxLimit, 500));
    
    return res.status(200).json({
      success: true,
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
