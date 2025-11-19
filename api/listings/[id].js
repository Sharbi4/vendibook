/**
 * GET /api/listings/[id]
 * POST /api/listings/[id] - Create booking/inquiry
 *
 * GET: Returns a single listing by ID
 * POST: Creates a booking request, inquiry, or event request based on listing type
 */

const db = require('../_db');

export default function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Listing ID is required' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res, id);
  } else if (req.method === 'POST') {
    return handlePost(req, res, id);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

function handleGet(req, res, id) {
  try {
    const listing = db.listings.getById(id);

    if (!listing) {
      return res.status(404).json({
        error: 'Listing not found',
        message: `No listing found with ID: ${id}`
      });
    }

    return res.status(200).json(listing);

  } catch (error) {
    console.error('Error fetching listing:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch listing'
    });
  }
}

function handlePost(req, res, id) {
  try {
    const listing = db.listings.getById(id);

    if (!listing) {
      return res.status(404).json({
        error: 'Listing not found',
        message: `No listing found with ID: ${id}`
      });
    }

    const { type, startDate, endDate, eventDate, guestCount, message, name, email, phone } = req.body;

    // Create appropriate request based on listing type
    let request;

    if (listing.listingType === 'RENT') {
      // Create booking request
      request = db.bookings.create({
        listingId: id,
        listingTitle: listing.title,
        startDate,
        endDate,
        message,
        name,
        email,
        phone,
        totalPrice: listing.price // Could calculate based on dates
      });
    } else if (listing.listingType === 'SALE') {
      // Create inquiry
      request = db.inquiries.create({
        listingId: id,
        listingTitle: listing.title,
        message,
        name,
        email,
        phone,
        askingPrice: listing.price
      });
    } else if (listing.listingType === 'EVENT_PRO') {
      // Create event request
      request = db.eventRequests.create({
        listingId: id,
        listingTitle: listing.title,
        hostName: listing.hostName,
        eventDate,
        guestCount,
        message,
        name,
        email,
        phone,
        hourlyRate: listing.price
      });
    }

    return res.status(200).json({
      ok: true,
      requestId: request.id,
      message: 'Request submitted successfully',
      request
    });

  } catch (error) {
    console.error('Error creating request:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create request'
    });
  }
}
