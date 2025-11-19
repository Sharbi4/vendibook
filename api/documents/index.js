import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { validateAuth } from '../_auth';

const prisma = new PrismaClient();

/**
 * POST /documents - Upload a document (insurance, permit, title, waiver)
 * POST /documents - List user's documents
 */
export default async function handler(req, res) {
  if (req.method === 'POST') {
    return handleUpload(req, res);
  } else if (req.method === 'GET') {
    return handleList(req, res);
  }
  
  res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });
}

/**
 * Upload a document
 */
async function handleUpload(req, res) {
  try {
    const user = await validateAuth(req);
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const {
      type,
      category,
      listingId,
      bookingId,
      fileUrl,
      fileKey,
      mimeType = 'application/pdf',
      fileSize = 0,
      expiresAt,
      metadata = {}
    } = req.body;

    // Validate required fields
    if (!type || !category || !fileUrl || !fileKey) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Missing required fields: type, category, fileUrl, fileKey',
        code: 400
      });
    }

    // Validate document type
    const validTypes = ['INSURANCE', 'PERMIT', 'TITLE', 'WAIVER', 'AGREEMENT', 'LICENSE', 'INSPECTION', 'OTHER'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TYPE',
        message: `Invalid document type. Must be one of: ${validTypes.join(', ')}`,
        code: 400
      });
    }

    // Authorization checks
    if (listingId) {
      const listing = await prisma.hostListing.findUnique({
        where: { id: listingId },
        select: { ownerId: true }
      });

      if (!listing) {
        return res.status(404).json({
          success: false,
          error: 'LISTING_NOT_FOUND',
          code: 404
        });
      }

      // Only owner or admin can upload docs for listing
      if (listing.ownerId !== user.id && user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'You can only upload documents for your own listings',
          code: 403
        });
      }
    }

    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { userId: true, listing: { select: { ownerId: true } } }
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'BOOKING_NOT_FOUND',
          code: 404
        });
      }

      // Only relevant parties can upload docs
      const isRenter = booking.userId === user.id;
      const isHost = booking.listing.ownerId === user.id;
      const isAdmin = user.role === 'ADMIN';

      if (!isRenter && !isHost && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          code: 403
        });
      }
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        id: uuidv4(),
        type,
        category,
        userId: user.id,
        listingId,
        bookingId,
        fileUrl,
        fileKey,
        mimeType,
        fileSize,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        uploadedBy: user.id,
        status: 'PENDING',
        metadata
      }
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPLOAD_DOCUMENT',
        resource: 'document',
        resourceId: document.id,
        listingId,
        changes: { type, category }
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        id: document.id,
        type: document.type,
        status: document.status,
        fileUrl: document.fileUrl,
        createdAt: document.createdAt
      },
      code: 201,
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    console.error('[Documents POST]', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to upload document',
      code: 500
    });
  }
}

/**
 * List documents (user's own or admin view)
 */
async function handleList(req, res) {
  try {
    const user = await validateAuth(req);
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const { listingId, bookingId, type, status, limit = 20, offset = 0 } = req.query;

    const where = {};

    // Users see only their own docs or docs for their listings/bookings
    if (user.role !== 'ADMIN') {
      const userListingIds = await prisma.hostListing
        .findMany({
          where: { ownerId: user.id },
          select: { id: true }
        })
        .then(listings => listings.map(l => l.id));

      const userBookingIds = await prisma.booking
        .findMany({
          where: { userId: user.id },
          select: { id: true }
        })
        .then(bookings => bookings.map(b => b.id));

      where.OR = [
        { userId: user.id },
        { listingId: { in: userListingIds } },
        { bookingId: { in: userBookingIds } }
      ];
    }

    // Apply filters
    if (listingId) where.listingId = listingId;
    if (bookingId) where.bookingId = bookingId;
    if (type) where.type = type;
    if (status) where.status = status;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        select: {
          id: true,
          type: true,
          category: true,
          status: true,
          fileUrl: true,
          expiresAt: true,
          createdAt: true,
          verifiedAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.document.count({ where })
    ]);

    return res.json({
      success: true,
      data: documents,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + parseInt(limit) < total
    });
  } catch (error) {
    console.error('[Documents GET]', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      code: 500
    });
  }
}
