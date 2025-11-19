/**
 * GET /api/host/listings - Get all listings owned by the current host
 * POST /api/host/listings - Create a new listing
 * 
 * Authentication: Required (Bearer token in Authorization header)
 * 
 * POST request body:
 * {
 *   title: string (required)
 *   listingType: "RENT" | "SALE" | "EVENT_PRO" (required)
 *   category: string (required)
 *   city: string (required)
 *   state: string (required)
 *   price: number (required)
 *   priceUnit: string (required)
 *   description: string
 *   imageUrl: string
 *   tags: string[]
 *   deliveryAvailable: boolean
 * }
 * 
 * Response: 200 OK
 * {
 *   count: number
 *   listings: [...]
 * }
 */

const db = require('../../_db');
const auth = require('../../_auth');

export default function handler(req, res) {
  // ========================================================================
  // GET /api/host/listings - Get host's listings
  // ========================================================================
  if (req.method === 'GET') {
    const user = auth.requireAuth(req, res);
    if (!user) return;
    
    try {
      const hostListings = db.host.getByUserId(user.id);
      
      return res.status(200).json({
        success: true,
        count: hostListings.length,
        listings: hostListings
      });
      
    } catch (error) {
      return res.status(500).json({
        error: 'Server error',
        message: error.message
      });
    }
  }
  
  // ========================================================================
  // POST /api/host/listings - Create new listing
  // ========================================================================
  if (req.method === 'POST') {
    const user = auth.requireAuth(req, res);
    if (!user) return;
    
    try {
      const { title, listingType, category, city, state, price, priceUnit, description, imageUrl, tags, deliveryAvailable } = req.body;
      
      // Validate required fields
      if (!title || !listingType || !category || !city || !state || !price || !priceUnit) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Missing required fields: title, listingType, category, city, state, price, priceUnit'
        });
      }
      
      const listingData = {
        title,
        listingType,
        category,
        city,
        state,
        location: `${city}, ${state}`,
        price: parseFloat(price),
        priceUnit,
        description: description || '',
        imageUrl: imageUrl || 'https://via.placeholder.com/800x500?text=No+Image',
        tags: Array.isArray(tags) ? tags : [],
        deliveryAvailable: deliveryAvailable || false,
        isVerified: true, // Auto-verified for new host listings
        rating: 5.0,
        reviewCount: 0,
        hostName: user.name,
        ownerId: user.id,
        ownerEmail: user.email
      };
      
      const newListing = db.host.create(user.id, listingData);
      
      return res.status(201).json({
        success: true,
        message: 'Listing created successfully',
        listing: newListing
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
