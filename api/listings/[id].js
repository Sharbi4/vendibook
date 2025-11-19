/**
 * GET /api/listings/[id] - Get a single listing by ID
 * POST /api/listings/[id] - Create a booking, inquiry, or event request
 */

const db = require('../../_db');

export default function handler(req, res) {
  const { id } = req.query;
  
  if (req.method === 'GET') {
    const listing = db.getListingById(id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    return res.status(200).json(listing);
  }
  
  if (req.method === 'POST') {
    // Create a booking, inquiry, or event request for this listing
    const listing = db.getListingById(id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    const { type, startDate, endDate, eventDate, guestCount, message } = req.body;
    
    let request;
    
    if (listing.listingType === 'RENT') {
      // Create a booking request
      request = db.addBooking({
        listingId: id,
        listingTitle: listing.title,
        type: 'BOOKING',
        startDate,
        endDate,
        message,
        status: 'pending'
      });
    } else if (listing.listingType === 'SALE') {
      // Create an inquiry
      request = db.addInquiry({
        listingId: id,
        listingTitle: listing.title,
        type: 'INQUIRY',
        message,
        status: 'pending'
      });
    } else if (listing.listingType === 'EVENT_PRO') {
      // Create an event request
      request = db.addEventRequest({
        listingId: id,
        listingTitle: listing.title,
        type: 'EVENT_REQUEST',
        eventDate,
        guestCount,
        message,
        status: 'pending'
      });
    }
    
    return res.status(201).json({
      ok: true,
      requestId: request.id,
      message: 'Request created successfully'
    });
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}
