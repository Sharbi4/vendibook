/**
 * GET /api/listings - Returns paginated listings with optional filters
 * Query params: type, category, location
 */

const db = require('../_db');

function filterListings(listings, filters = {}) {
  return listings.filter(listing => {
    // Filter by listing type (RENT, SALE, EVENT_PRO)
    if (filters.listingType && listing.listingType !== filters.listingType) {
      return false;
    }
    
    // Filter by category
    if (filters.category && listing.category !== filters.category) {
      return false;
    }
    
    // Filter by location (simple substring match)
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      if (!listing.location.toLowerCase().includes(locationLower)) {
        return false;
      }
    }
    
    // Filter by price range
    if (filters.priceMin && listing.price < parseFloat(filters.priceMin)) {
      return false;
    }
    if (filters.priceMax && listing.price > parseFloat(filters.priceMax)) {
      return false;
    }
    
    // Filter by verified vendor only
    if (filters.verifiedOnly === 'true' && !listing.verifiedVendor) {
      return false;
    }
    
    // Filter by delivery only
    if (filters.deliveryOnly === 'true' && !listing.deliveryOnly) {
      return false;
    }
    
    return true;
  });
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    const {
      listingType,
      category,
      location,
      priceMin,
      priceMax,
      verifiedOnly,
      deliveryOnly
    } = req.query;
    
    const filters = {
      listingType,
      category,
      location,
      priceMin,
      priceMax,
      verifiedOnly,
      deliveryOnly
    };
    
    const results = filterListings(db.getListings(), filters);
    
    return res.status(200).json({
      count: results.length,
      listings: results
    });
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}
