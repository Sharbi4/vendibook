/**
 * GET /api/host/listings/:id - Get a specific host listing
 * PUT /api/host/listings/:id - Update a host listing (full update)
 * PATCH /api/host/listings/:id - Partial update of a host listing
 * DELETE /api/host/listings/:id - Delete a host listing
 * 
 * Authentication: Required
 */

const db = require('../../../_db');
const auth = require('../../../_auth');

export default function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Listing ID is required'
    });
  }
  
  // ========================================================================
  // GET /api/host/listings/:id - Get host listing
  // ========================================================================
  if (req.method === 'GET') {
    const user = auth.requireAuth(req, res);
    if (!user) return;
    
    try {
      const listing = db.host.getById(id);
      
      if (!listing) {
        return res.status(404).json({
          error: 'Not found',
          message: `Listing with ID ${id} not found`
        });
      }
      
      // Only allow host to view their own listing
      if (listing.ownerId !== user.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to view this listing'
        });
      }
      
      return res.status(200).json({
        success: true,
        listing
      });
      
    } catch (error) {
      return res.status(500).json({
        error: 'Server error',
        message: error.message
      });
    }
  }
  
  // ========================================================================
  // PUT /api/host/listings/:id - Full update
  // ========================================================================
  if (req.method === 'PUT') {
    const user = auth.requireAuth(req, res);
    if (!user) return;
    
    try {
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
          message: 'You do not have permission to edit this listing'
        });
      }
      
      const updated = db.host.update(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Listing updated successfully',
        listing: updated
      });
      
    } catch (error) {
      return res.status(500).json({
        error: 'Server error',
        message: error.message
      });
    }
  }
  
  // ========================================================================
  // PATCH /api/host/listings/:id - Partial update
  // ========================================================================
  if (req.method === 'PATCH') {
    const user = auth.requireAuth(req, res);
    if (!user) return;
    
    try {
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
          message: 'You do not have permission to edit this listing'
        });
      }
      
      const updated = db.host.update(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Listing updated successfully',
        listing: updated
      });
      
    } catch (error) {
      return res.status(500).json({
        error: 'Server error',
        message: error.message
      });
    }
  }
  
  // ========================================================================
  // DELETE /api/host/listings/:id - Delete listing
  // ========================================================================
  if (req.method === 'DELETE') {
    const user = auth.requireAuth(req, res);
    if (!user) return;
    
    try {
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
          message: 'You do not have permission to delete this listing'
        });
      }
      
      const deleted = db.host.delete(id);
      
      if (!deleted) {
        return res.status(500).json({
          error: 'Server error',
          message: 'Failed to delete listing'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Listing deleted successfully'
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
