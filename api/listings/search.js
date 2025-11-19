/**
 * POST /api/listings/search - Advanced search with complex filters
 */

const db = require('../_db');

function filterListings(listings, filters = {}) {
  return listings.filter(listing => {
    // Filter by listing type
    if (filters.listingType && listing.listingType !== filters.listingType) {
      return false;
    }
    
    // Filter by category
    if (filters.category && listing.category !== filters.category) {
      return false;
    }
    
    // Filter by location
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
    
    // Filter by amenities (all specified amenities must be present)
    if (filters.amenities && Array.isArray(filters.amenities)) {
      const hasAllAmenities = filters.amenities.every(amenity =>
        listing.amenities && listing.amenities.includes(amenity)
      );
      if (!hasAllAmenities) {
        return false;
      }
    }
    
    // Filter by verified vendor
    if (filters.verifiedOnly && !listing.verifiedVendor) {
      return false;
    }
    
    // Filter by delivery only
    if (filters.deliveryOnly && !listing.deliveryOnly) {
      return false;
    }
    
    return true;
  });
}

export default function handler(req, res) {
  if (req.method === 'POST') {
    const filters = req.body || {};
    const results = filterListings(db.getListings(), filters);
    
    return res.status(200).json({
      count: results.length,
      listings: results
    });
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}
