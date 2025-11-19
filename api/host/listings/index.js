/**
 * GET /api/host/listings - Get all listings for current host
 * POST /api/host/listings - Create a new listing
 */

const db = require('../../_db');
const { requireAuth } = require('../../_auth');

export default function handler(req, res) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

function handleGet(req, res) {
  try {
    // Require authentication
    const user = requireAuth(req, res);
    if (!user) return; // requireAuth already sent 401 response

    // Get all listings owned by this user
    const listings = db.hostListings.getByOwnerId(user.id);

    return res.status(200).json(listings);

  } catch (error) {
    console.error('Error fetching host listings:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch your listings'
    });
  }
}

function handlePost(req, res) {
  try {
    // Require authentication
    const user = requireAuth(req, res);
    if (!user) return; // requireAuth already sent 401 response

    const listingData = req.body;

    // Validate required fields
    if (!listingData.title || !listingData.listingType || !listingData.price) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Title, listing type, and price are required'
      });
    }

    // Create listing with owner info
    const newListing = db.hostListings.create({
      ...listingData,
      ownerId: user.id,
      hostName: user.name,
      isVerified: false, // New hosts need verification
      rating: 0,
      reviewCount: 0
    });

    return res.status(201).json(newListing);

  } catch (error) {
    console.error('Error creating listing:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create listing'
    });
  }
}
