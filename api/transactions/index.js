import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { validateAuth } from '../_auth';

const prisma = new PrismaClient();

/**
 * POST /transactions - Create a transaction
 * GET /transactions - List user's transactions
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
 * Create a transaction
 */
async function handleCreate(req, res) {
  try {
    const user = await validateAuth(req);
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const {
      type,
      bookingId,
      listingId,
      amount,
      currency = 'USD',
      platformFee = 0,
      commission = 0,
      paymentMethod,
      paymentIntentId,
      metadata = {}
    } = req.body;

    // Validate required fields
    if (!type || !amount) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Missing required fields: type, amount',
        code: 400
      });
    }

    // Validate transaction type
    const validTypes = ['BOOKING_PAYMENT', 'REFUND', 'PAYOUT', 'COMMISSION', 'PLATFORM_FEE', 'SUBSCRIPTION_CHARGE'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TYPE',
        message: `Invalid transaction type. Must be one of: ${validTypes.join(', ')}`,
        code: 400
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_AMOUNT',
        message: 'Amount must be greater than 0',
        code: 400
      });
    }

    // Authorization checks
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

      // Only renter or host can create transaction for their booking
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

      // Only host can create transaction for their listing
      if (listing.ownerId !== user.id && user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          code: 403
        });
      }
    }

    // Calculate net amount
    const netAmount = amount - platformFee - commission;

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        id: uuidv4(),
        type,
        userId: user.id,
        bookingId,
        listingId,
        amount,
        currency,
        platformFee,
        commission,
        netAmount,
        paymentMethod,
        paymentIntentId,
        status: 'PENDING', // Will be COMPLETED after payment processing
        metadata: {
          ...metadata,
          createdBy: user.id,
          createdAt: new Date().toISOString()
        }
      }
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_TRANSACTION',
        resource: 'transaction',
        resourceId: transaction.id,
        listingId,
        changes: { type, amount, status: 'PENDING' }
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        id: transaction.id,
        type: transaction.type,
        status: transaction.status,
        amount: transaction.amount,
        netAmount: transaction.netAmount,
        createdAt: transaction.createdAt,
        message: 'Note: This is a MOCK transaction. Real payment processing not yet integrated.'
      },
      code: 201
    });
  } catch (error) {
    console.error('[Transactions POST]', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      code: 500
    });
  }
}

/**
 * List user's transactions
 */
async function handleList(req, res) {
  try {
    const user = await validateAuth(req);
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const { type, status, bookingId, limit = 20, offset = 0 } = req.query;

    const where = { userId: user.id };

    // Apply filters
    if (type) where.type = type;
    if (status) where.status = status;
    if (bookingId) where.bookingId = bookingId;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        select: {
          id: true,
          type: true,
          status: true,
          amount: true,
          netAmount: true,
          platformFee: true,
          currency: true,
          createdAt: true,
          processedAt: true,
          bookingId: true,
          booking: {
            select: {
              id: true,
              listing: { select: { title: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.transaction.count({ where })
    ]);

    return res.json({
      success: true,
      data: transactions,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + parseInt(limit) < total
    });
  } catch (error) {
    console.error('[Transactions GET]', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      code: 500
    });
  }
}
