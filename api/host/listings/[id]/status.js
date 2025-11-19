/**
 * PATCH /api/host/listings/[id]/status - Update listing status (live, paused, etc.)
 */

const db = require('../../../../_db');
const { requireAuth } = require('../../../../_auth');

export default function handler(req, res) {
  const { id } = req.query;
  
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
    
    const { status } = req.body;
    
    if (!['live', 'paused', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const updated = db.updateHostListing(id, { status });
    return res.status(200).json(updated);
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}
