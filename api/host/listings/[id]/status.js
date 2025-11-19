/**
 * PATCH /api/host/listings/:id/status - Update listing status
 * 
 * Request body:
 * {
 *   status: 'draft' | 'live' | 'paused' | 'archived' | 'sold'
 * }
 * 
 * Response: 200 OK
 * {
 *   success: boolean
 *   listing: { ... (updated listing object) ... }
 *   message: string
 * }
 */

const db = require('../../../../_db');
const auth = require('../../../../_auth');

const VALID_STATUSES = ['draft', 'live', 'paused', 'archived', 'sold'];

export default function handler(req, res) {
  const { id } = req.query;
  
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const user = auth.requireAuth(req, res);
    if (!user) return;
    
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
    
    if (listing.ownerId !== user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update this listing'
      });
    }
    
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Status field is required'
      });
    }
    
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }
    
    const updated = db.host.updateStatus(id, status);
    
    return res.status(200).json({
      success: true,
      listing: updated,
      message: `Listing status changed to "${status}"`
    });
    
  } catch (error) {
    return res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
}
