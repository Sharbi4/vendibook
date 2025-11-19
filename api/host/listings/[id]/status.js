/**
 * PATCH /api/host/listings/[id]/status
 *
 * Update listing status (live, paused, deleted)
 */

const db = require('../../../_db');
const { requireAuth } = require('../../../_auth');

export default function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Listing ID is required' });
  }

  try {
    const user = requireAuth(req, res);
    if (!user) return;

    const listing = db.hostListings.getById(id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.ownerId !== user.id) {
      return res.status(403).json({
        error: 'Not authorized',
        message: 'You can only update your own listings'
      });
    }

    const { status } = req.body;

    // Validate status
    const validStatuses = ['live', 'paused', 'deleted'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updatedListing = db.hostListings.updateStatus(id, status);

    return res.status(200).json(updatedListing);

  } catch (error) {
    console.error('Error updating listing status:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update listing status'
    });
  }
}
