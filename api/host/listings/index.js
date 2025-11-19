/**
 * POST /api/host/listings - Create a new listing as a host
 * GET /api/host/listings - Get all listings owned by the current host
 */

const db = require('../../_db');
const { requireAuth } = require('../../_auth');

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Create a new host listing
    const user = requireAuth(req, res);
    if (!user) return;
    
    const listingData = req.body;
    
    const newListing = db.addHostListing({
      ...listingData,
      ownerId: user.id,
      ownerName: user.name,
      ownerEmail: user.email
    });
    
    return res.status(201).json(newListing);
  }
  
  if (req.method === 'GET') {
    // Get all listings owned by the current host
    const user = requireAuth(req, res);
    if (!user) return;
    
    const hostListings = db.getHostListingsByUserId(user.id);
    
    return res.status(200).json({
      count: hostListings.length,
      listings: hostListings
    });
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}
