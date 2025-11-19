/**
 * GET /api/wishlist
 * POST /api/wishlist (add listing)
 * DELETE /api/wishlist/:listingId (remove listing)
 */

const { requireAuth } = require('../../auth-service');
const db = require('../../db');

module.exports = async (req, res) => {
  try {
    const user = await requireAuth(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { method } = req;

    // GET - Get user's wishlist
    if (method === 'GET') {
      const wishlistItems = await db.wishlist.getByUserId(user.id);
      return res.status(200).json(wishlistItems);
    }

    // POST - Add to wishlist
    if (method === 'POST') {
      const { listingId } = req.body;

      if (!listingId) {
        return res.status(400).json({ error: 'listingId required' });
      }

      // Check if listing exists
      const listing = await db.host.getById(listingId);
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      // Check if already in wishlist
      const isInWishlist = await db.wishlist.isInWishlist(user.id, listingId);
      if (isInWishlist) {
        return res.status(400).json({ error: 'Already in wishlist' });
      }

      const item = await db.wishlist.add(user.id, listingId);
      return res.status(201).json(item);
    }

    // DELETE - Remove from wishlist
    if (method === 'DELETE') {
      const listingId = req.query.listingId || req.url.split('/').pop();

      if (!listingId) {
        return res.status(400).json({ error: 'listingId required' });
      }

      // Check if in wishlist
      const isInWishlist = await db.wishlist.isInWishlist(user.id, listingId);
      if (!isInWishlist) {
        return res.status(404).json({ error: 'Not in wishlist' });
      }

      await db.wishlist.remove(user.id, listingId);
      return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Wishlist endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
