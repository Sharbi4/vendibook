/**
 * GET /api/listings/:id - Get a single listing by ID
 * POST /api/listings/:id - Create a booking, inquiry, or event request
 */

const db = require('../_db');
const auth = require('../_auth');

export default function handler(req, res) {
  const { id } = req.query;
  
  // ========================================================================
  // GET /api/listings/:id - Get single listing
  // ========================================================================
  if (req.method === 'GET') {
    if (!id) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Listing ID is required'
      });
    }
    
    const listing = db.listings.getById(id);
    if (!listing) {
      return res.status(404).json({
        error: 'Not found',
        message: `Listing with ID ${id} not found`
      });
    }
    
    // Increment view count
    listing.views = (listing.views || 0) + 1;
    
    return res.status(200).json(listing);
  }
  
  // ========================================================================
  // POST /api/listings/:id - Create booking/inquiry/event request
  // ========================================================================
  if (req.method === 'POST') {
    // Require authentication
    const user = auth.requireAuth(req, res);
    if (!user) return;
    
    if (!id) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Listing ID is required'
      });
    }
    
    const listing = db.listings.getById(id);
    if (!listing) {
      return res.status(404).json({
        error: 'Not found',
        message: `Listing with ID ${id} not found`
      });
    }
    
    const { type: _type, startDate, endDate, eventDate, guestCount, message } = req.body;
    
    let request;
    
    try {
      if (listing.listingType === 'RENT') {
        // Create a booking request
        if (!startDate || !endDate) {
          return res.status(400).json({
            error: 'Validation failed',
            message: 'startDate and endDate are required for rental bookings'
          });
        }
        
        request = db.bookings.create(id, user.id, {
          listingTitle: listing.title,
          listingType: 'BOOKING',
          startDate,
          endDate,
          message,
          price: listing.price,
          priceUnit: listing.priceUnit
        });
        
      } else if (listing.listingType === 'SALE') {
        // Create an inquiry
        request = db.inquiries.create(id, user.id, {
          listingTitle: listing.title,
          inquiryType: 'SALE_INQUIRY',
          message,
          price: listing.price
        });
        
      } else if (listing.listingType === 'EVENT_PRO') {
        // Create an event request
        if (!eventDate) {
          return res.status(400).json({
            error: 'Validation failed',
            message: 'eventDate is required for event professional bookings'
          });
        }
        
        request = db.bookings.create(id, user.id, {
          listingTitle: listing.title,
          listingType: 'EVENT_REQUEST',
          eventDate,
          guestCount: guestCount || 1,
          message,
          price: listing.price,
          priceUnit: listing.priceUnit
        });
      }
      
      return res.status(201).json({
        success: true,
        requestId: request.id,
        message: 'Request created successfully',
        request
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
