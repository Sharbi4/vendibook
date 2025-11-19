import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { validateAuth } from '../_auth';

const prisma = new PrismaClient();

/**
 * POST /inquiries - Create an inquiry
 * GET /inquiries - List inquiries (user's own)
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
 * Create a new inquiry
 */
async function handleCreate(req, res) {
  try {
    const user = await validateAuth(req);
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const { listingId, inquiryType = 'GENERAL_INQUIRY', message, price } = req.body;

    // Validate required fields
    if (!listingId || !message) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Missing required fields: listingId, message',
        code: 400
      });
    }

    // Validate inquiry type
    const validTypes = ['PRICE_INQUIRY', 'CONDITION_INQUIRY', 'AVAILABILITY_INQUIRY', 'GENERAL_INQUIRY'];
    if (!validTypes.includes(inquiryType)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TYPE',
        message: `Invalid inquiry type. Must be one of: ${validTypes.join(', ')}`,
        code: 400
      });
    }

    // Verify listing exists and is SALE type
    const listing = await prisma.hostListing.findUnique({
      where: { id: listingId },
      select: { id: true, ownerId: true, listingType: true }
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'LISTING_NOT_FOUND',
        code: 404
      });
    }

    // Can't inquire about your own listing
    if (listing.ownerId === user.id) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'You cannot create an inquiry on your own listing',
        code: 400
      });
    }

    // Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        listingId,
        inquiryType,
        message,
        price,
        status: 'OPEN'
      }
    });

    // Notify host
    const host = await prisma.user.findUnique({
      where: { id: listing.ownerId },
      select: { id: true }
    });

    if (host) {
      await prisma.notification.create({
        data: {
          userId: host.id,
          type: 'INQUIRY_RECEIVED',
          title: 'New Inquiry',
          message: `A buyer is interested in your listing and sent an inquiry`,
          relatedId: inquiry.id
        }
      });
    }

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_INQUIRY',
        resource: 'inquiry',
        resourceId: inquiry.id,
        listingId,
        changes: { inquiryType }
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        id: inquiry.id,
        status: inquiry.status,
        createdAt: inquiry.createdAt
      },
      code: 201,
      message: 'Inquiry created successfully'
    });
  } catch (error) {
    console.error('[Inquiries POST]', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      code: 500
    });
  }
}

/**
 * List inquiries
 */
async function handleList(req, res) {
  try {
    const user = await validateAuth(req);
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const { listingId, status, type, limit = 20, offset = 0, role = 'buyer' } = req.query;

    const where = {};

    // Determine what inquiries user can see
    if (role === 'seller') {
      // Seller sees inquiries on their listings
      const userListingIds = await prisma.hostListing
        .findMany({
          where: { ownerId: user.id },
          select: { id: true }
        })
        .then(listings => listings.map(l => l.id));

      where.listingId = { in: userListingIds };
    } else {
      // Buyer sees their own inquiries
      where.userId = user.id;
    }

    // Apply filters
    if (listingId) where.listingId = listingId;
    if (status) where.status = status;
    if (type) where.inquiryType = type;

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        select: {
          id: true,
          inquiryType: true,
          message: true,
          price: true,
          status: true,
          createdAt: true,
          respondedAt: true,
          user: { select: { id: true, name: true, email: true, phoneNumber: true } },
          listing: { select: { id: true, title: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.inquiry.count({ where })
    ]);

    return res.json({
      success: true,
      data: inquiries,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + parseInt(limit) < total
    });
  } catch (error) {
    console.error('[Inquiries GET]', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      code: 500
    });
  }
}
