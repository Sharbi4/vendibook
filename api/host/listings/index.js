/**
 * GET /api/host/listings - Get all listings owned by the current host
 * POST /api/host/listings - Create a new listing as a host
 * 
 * All endpoints require authentication (Bearer token)
 */

const db = require('../../_db');
const auth = require('../../_auth');

export default function handler(req, res) {
  // ========================================================================
  // GET /api/host/listings - Get my listings
  // ========================================================================
  if (req.method === 'GET') {
    const user = auth.requireAuth(req, res);
    if (!user) return;
    
    try {
      const hostListings = db.host.getByUserId(user.id);
      
      return res.status(200).json({
        count: hostListings.length,
        listings: hostListings
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Server error',
        message: error.message
      });
    }
  }
  
  // ========================================================================
  // POST /api/host/listings - Create new listing
  // ========================================================================
  if (req.method === 'POST') {
    const user = auth.requireAuth(req, res);
    if (!user) return;
    
    try {
      const listingData = req.body;
      
      // Validate required fields
      if (!listingData.title || !listingData.listingType || !listingData.price) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Missing required fields: title, listingType, price'
        });
      }
      
      // Create listing
      const newListing = db.host.create(user.id, {
        ...listingData,
        ownerName: user.name,
        ownerEmail: user.email,
        ownerId: user.id
      });
      
      return res.status(201).json({
        success: true,
        listing: newListing,
        message: 'Listing created successfully'
      });
      
    } catch (error) {
      return res.status(500).json({
        error: 'Server error',
        message: error.message
      });
    }
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}
