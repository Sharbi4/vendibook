import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { validateAuth } from '../_auth';

const prisma = new PrismaClient();

/**
 * POST /event-requests - Create an event request
 * GET /event-requests - List event requests
 */
export default async function handler(req, res) {
  if (req.method === 'POST') {
    return handleCreate(req, res);
  } else if (req.method === 'GET') {
    return handleList(req, res);
  }

  res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });
}

/**
 * Create an event request
 */
async function handleCreate(req, res) {
  try {
    const user = await validateAuth(req);
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const { listingId, eventDate, eventType, guestCount, budget, message } = req.body;

    // Validate required fields
    if (!listingId || !eventDate || !eventType || !guestCount) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Missing required fields: listingId, eventDate, eventType, guestCount',
        code: 400
      });
    }

    // Validate guest count
    if (guestCount < 1) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_GUEST_COUNT',
        message: 'Guest count must be at least 1',
        code: 400
      });
    }

    // Verify listing exists and is EVENT_PRO type
    const listing = await prisma.hostListing.findUnique({
      where: { id: listingId },
      select: { id: true, listingType: true, ownerId: true, title: true }
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'LISTING_NOT_FOUND',
        code: 404
      });
    }

    if (listing.listingType !== 'EVENT_PRO') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_LISTING_TYPE',
        message: 'Can only create event requests for EVENT_PRO listings',
        code: 400
      });
    }

    // Can't request from yourself
    if (listing.ownerId === user.id) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'You cannot create an event request for your own listing',
        code: 400
      });
    }

    // Validate event date is in future
    const eventDateTime = new Date(eventDate);
    if (eventDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_DATE',
        message: 'Event date must be in the future',
        code: 400
      });
    }

    // Create event request
    const eventRequest = await prisma.eventRequest.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        listingId,
        eventDate: eventDateTime,
        eventType,
        guestCount,
        budget,
        message,
        status: 'PENDING'
      }
    });

    // Notify event pro
    const eventPro = await prisma.user.findUnique({
      where: { id: listing.ownerId },
      select: { id: true }
    });

    if (eventPro) {
      await prisma.notification.create({
        data: {
          userId: eventPro.id,
          type: 'EVENT_REQUEST',
          title: 'New Event Request',
          message: `You received a new event request for ${eventType}`,
          relatedId: eventRequest.id
        }
      });
    }

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_EVENT_REQUEST',
        resource: 'event_request',
        resourceId: eventRequest.id,
        listingId,
        changes: { eventType, guestCount }
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        id: eventRequest.id,
        status: eventRequest.status,
        eventDate: eventRequest.eventDate,
        createdAt: eventRequest.createdAt
      },
      code: 201,
      message: 'Event request created successfully'
    });
  } catch (error) {
    console.error('[Event Requests POST]', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      code: 500
    });
  }
}

/**
 * List event requests
 */
async function handleList(req, res) {
  try {
    const user = await validateAuth(req);
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const { listingId, status, limit = 20, offset = 0, role = 'renter' } = req.query;

    const where = {};

    // Determine what requests user can see
    if (role === 'event_pro') {
      // Event pro sees requests for their listings
      const userListingIds = await prisma.hostListing
        .findMany({
          where: { ownerId: user.id, listingType: 'EVENT_PRO' },
          select: { id: true }
        })
        .then(listings => listings.map(l => l.id));

      where.listingId = { in: userListingIds };
    } else {
      // Renter sees their own requests
      where.userId = user.id;
    }

    // Apply filters
    if (listingId) where.listingId = listingId;
    if (status) where.status = status;

    const [requests, total] = await Promise.all([
      prisma.eventRequest.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phoneNumber: true } },
          listing: { select: { id: true, title: true } }
        },
        orderBy: { eventDate: 'asc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.eventRequest.count({ where })
    ]);

    return res.json({
      success: true,
      data: requests,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + parseInt(limit) < total
    });
  } catch (error) {
    console.error('[Event Requests GET]', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      code: 500
    });
  }
}
