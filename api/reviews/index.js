import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { validateAuth } from '../_auth';

const prisma = new PrismaClient();

/**
 * POST /reviews - Create a review
 * GET /reviews - List reviews (for user dashboard)
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
 * Create a new review
 */
async function handleCreate(req, res) {
  try {
    const user = await validateAuth(req);
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const { listingId, hostListingId, bookingId, rating, comment } = req.body;

    // Validate required fields
    if (!listingId && !hostListingId) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Missing required field: either listingId or hostListingId',
        code: 400
      });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_RATING',
        message: 'Rating must be an integer between 1 and 5',
        code: 400
      });
    }

    // Verify listing exists
    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { id: true }
      });
      if (!listing) {
        return res.status(404).json({
          success: false,
          error: 'LISTING_NOT_FOUND',
          code: 404
        });
      }
    }

    if (hostListingId) {
      const hostListing = await prisma.hostListing.findUnique({
        where: { id: hostListingId },
        select: { id: true, ownerId: true }
      });
      if (!hostListing) {
        return res.status(404).json({
          success: false,
          error: 'LISTING_NOT_FOUND',
          code: 404
        });
      }
      // Can't review your own listing
      if (hostListing.ownerId === user.id) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_REQUEST',
          message: 'You cannot review your own listing',
          code: 400
        });
      }
    }

    // Optional: Verify booking exists if provided
    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { id: true, userId: true, status: true }
      });
      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'BOOKING_NOT_FOUND',
          code: 404
        });
      }
      // Only renter of completed booking can review
      if (booking.userId !== user.id || booking.status !== 'COMPLETED') {
        return res.status(400).json({
          success: false,
          error: 'INVALID_BOOKING',
          message: 'You can only review completed bookings',
          code: 400
        });
      }
    }

    // Check for duplicate review
    if (listingId && bookingId) {
      const existing = await prisma.review.findFirst({
        where: {
          userId: user.id,
          listingId,
          bookingId
        }
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'DUPLICATE_REVIEW',
          message: 'You have already reviewed this booking',
          code: 409
        });
      }
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        listingId,
        hostListingId,
        rating,
        comment
      }
    });

    // Update listing average rating
    if (listingId) {
      const reviews = await prisma.review.findMany({
        where: { listingId },
        select: { rating: true }
      });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      
      await prisma.listing.update({
        where: { id: listingId },
        data: {
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length
        }
      });
    }

    if (hostListingId) {
      const reviews = await prisma.review.findMany({
        where: { hostListingId },
        select: { rating: true }
      });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      
      const hostListing = await prisma.hostListing.findUnique({
        where: { id: hostListingId },
        select: { ownerId: true }
      });

      // Update listing rating
      // Note: Denormalized listing also updated if syncing
    }

    // Notify listing owner
    if (hostListingId) {
      const hostListing = await prisma.hostListing.findUnique({
        where: { id: hostListingId },
        select: { ownerId: true }
      });
      
      await prisma.notification.create({
        data: {
          userId: hostListing.ownerId,
          type: 'REVIEW_RECEIVED',
          title: 'New Review',
          message: `You received a ${rating}-star review`,
          relatedId: review.id
        }
      });
    }

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_REVIEW',
        resource: 'review',
        resourceId: review.id,
        listingId: hostListingId,
        changes: { rating }
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        id: review.id,
        rating: review.rating,
        createdAt: review.createdAt
      },
      code: 201,
      message: 'Review created successfully'
    });
  } catch (error) {
    console.error('[Reviews POST]', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      code: 500
    });
  }
}

/**
 * List reviews
 */
async function handleList(req, res) {
  try {
    const user = await validateAuth(req);
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const { listingId, hostListingId, limit = 20, offset = 0, sortBy = 'recent' } = req.query;

    if (!listingId && !hostListingId) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Must provide either listingId or hostListingId',
        code: 400
      });
    }

    const where = {};
    if (listingId) where.listingId = listingId;
    if (hostListingId) where.hostListingId = hostListingId;

    const orderBy = sortBy === 'rating' ? { rating: 'desc' } : { createdAt: 'desc' };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { id: true, name: true, avatarUrl: true } }
        },
        orderBy,
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.review.count({ where })
    ]);

    const avgRating = total > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return res.json({
      success: true,
      data: reviews,
      averageRating: Math.round(avgRating * 10) / 10,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + parseInt(limit) < total
    });
  } catch (error) {
    console.error('[Reviews GET]', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      code: 500
    });
  }
}
