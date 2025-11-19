/**
 * GET /api/host/listings/[id] - Get single host listing
 * PUT /api/host/listings/[id] - Update host listing
 * DELETE /api/host/listings/[id] - Delete host listing
 */

const db = require('../../_db');
const { requireAuth } = require('../../_auth');

export default function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Listing ID is required' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res, id);
  } else if (req.method === 'PUT') {
    return handlePut(req, res, id);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

function handleGet(req, res, id) {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    const listing = db.hostListings.getById(id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Only allow host to view their own listing details
    if (listing.ownerId !== user.id) {
      return res.status(403).json({ error: 'Not authorized to view this listing' });
    }

    return res.status(200).json(listing);

  } catch (error) {
    console.error('Error fetching listing:', error);
    return res.status(500).json({ error: 'Failed to fetch listing' });
  }
}

function handlePut(req, res, id) {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    const listing = db.hostListings.getById(id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Only allow host to update their own listing
    if (listing.ownerId !== user.id) {
      return res.status(403).json({
        error: 'Not authorized',
        message: 'You can only update your own listings'
      });
    }

    const updates = req.body;

    // Prevent updating sensitive fields
    delete updates.id;
    delete updates.ownerId;
    delete updates.createdAt;

    const updatedListing = db.hostListings.update(id, updates);

    return res.status(200).json(updatedListing);

  } catch (error) {
    console.error('Error updating listing:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update listing'
    });
  }
}

function handleDelete(req, res, id) {
  try {
    const user = requireAuth(req, res);
    if (!user) return;

    const listing = db.hostListings.getById(id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.ownerId !== user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }

    // For now, just set status to 'deleted'
    const updatedListing = db.hostListings.update(id, { status: 'deleted' });

    return res.status(200).json({
      ok: true,
      message: 'Listing deleted successfully',
      listing: updatedListing
    });

  } catch (error) {
    console.error('Error deleting listing:', error);
    return res.status(500).json({ error: 'Failed to delete listing' });
  }
}
