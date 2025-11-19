/**
 * PATCH /api/host/listings/:id/status - Update listing status
 * 
 * Valid statuses: draft, live, paused, sold, archived
 * 
 * Request body:
 * {
 *   status: "draft" | "live" | "paused" | "sold" | "archived"
 * }
 * 
 * Response: 200 OK
 * {
 *   success: true
 *   listing: { ... }
 * }
 */

const db = require('../../../../_db');
const auth = require('../../../../_auth');

const VALID_STATUSES = ['draft', 'live', 'paused', 'sold', 'archived'];

export default function handler(req, res) {
  const { id } = req.query;
  
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const user = auth.requireAuth(req, res);
  if (!user) return;
  
  try {
    if (!id) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Listing ID is required'
      });
    }
    
    const listing = db.host.getById(id);
    
    if (!listing) {
      return res.status(404).json({
        error: 'Not found',
        message: `Listing with ID ${id} not found`
      });
    }
    
    // Check ownership
    if (listing.ownerId !== user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update this listing'
      });
    }
    
    // Validate status
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Status is required'
      });
    }
    
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }
    
    // Update listing status
    const updated = db.host.updateStatus(id, status);
    
    return res.status(200).json({
      success: true,
      message: `Listing status updated to "${status}"`,
      listing: updated
    });
    
  } catch (error) {
    return res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
}
