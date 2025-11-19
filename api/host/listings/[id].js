/**
 * GET /api/host/listings/[id] - Get a specific host listing
 * PUT /api/host/listings/[id] - Update a host listing (full update)
 * PATCH /api/host/listings/[id] - Partial update of a host listing
 */

const db = require('../../../_db');
const { requireAuth } = require('../../../_auth');

export default function handler(req, res) {
  const { id } = req.query;
  
  if (req.method === 'GET') {
    const user = requireAuth(req, res);
    if (!user) return;
    
    const listing = db.getHostListingById(id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    // Only allow host to view their own listing
    if (listing.ownerId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    return res.status(200).json(listing);
  }
  
  if (req.method === 'PUT') {
    const user = requireAuth(req, res);
    if (!user) return;
    
    const listing = db.getHostListingById(id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    if (listing.ownerId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const updated = db.updateHostListing(id, req.body);
    return res.status(200).json(updated);
  }
  
  if (req.method === 'PATCH') {
    const user = requireAuth(req, res);
    if (!user) return;
    
    const listing = db.getHostListingById(id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    if (listing.ownerId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const updated = db.updateHostListing(id, req.body);
    return res.status(200).json(updated);
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}
