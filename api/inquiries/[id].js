import { PrismaClient } from '@prisma/client';
import { validateAuth } from '../../_auth';

const prisma = new PrismaClient();

/**
 * GET /inquiries/{id} - Get inquiry details
 * PATCH /inquiries/{id} - Respond to inquiry (change status)
 * DELETE /inquiries/{id} - Delete inquiry
 */
export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    return handleGet(req, res, id);
  } else if (req.method === 'PATCH') {
    return handleUpdate(req, res, id);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  }

  res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });
}

/**
 * Get inquiry details
 */
async function handleGet(req, res, id) {
  try {
    const user = await validateAuth(req);
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phoneNumber: true } },
        listing: { select: { id: true, title: true, ownerId: true } }
      }
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'INQUIRY_NOT_FOUND',
        code: 404
      });
    }

    // Authorization: only inquirer, listing owner, or admin
    const isInquirer = inquiry.userId === user.id;
    const isListingOwner = inquiry.listing.ownerId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isInquirer && !isListingOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        code: 403
      });
    }

    return res.json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    console.error('[Inquiry GET]', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      code: 500
    });
  }
}

/**
 * Update inquiry status (respond to inquiry)
 */
async function handleUpdate(req, res, id) {
  try {
    const user = await validateAuth(req);
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const { status, message } = req.body;

    // Validate status
    const validStatuses = ['OPEN', 'RESPONDED', 'CLOSED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
        code: 400
      });
    }

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: { listing: { select: { ownerId: true } } }
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'INQUIRY_NOT_FOUND',
        code: 404
      });
    }

    // Only listing owner can respond to inquiries
    if (inquiry.listing.ownerId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Only the listing owner can respond to inquiries',
        code: 403
      });
    }

    // Update inquiry
    const updated = await prisma.inquiry.update({
      where: { id },
      data: {
        status: status || inquiry.status,
        respondedAt: status === 'RESPONDED' ? new Date() : inquiry.respondedAt
      }
    });

    // Notify inquirer if responding
    if (status === 'RESPONDED') {
      await prisma.notification.create({
        data: {
          userId: inquiry.userId,
          type: 'INQUIRY_RESPONDED',
          title: 'Inquiry Response',
          message: `The seller has responded to your inquiry`,
          relatedId: inquiry.id
        }
      });
    }

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'RESPOND_INQUIRY',
        resource: 'inquiry',
        resourceId: id,
        listingId: inquiry.listingId,
        changes: { status, respondedAt: new Date() }
      }
    });

    return res.json({
      success: true,
      data: updated,
      message: 'Inquiry updated'
    });
  } catch (error) {
    console.error('[Inquiry PATCH]', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      code: 500
    });
  }
}

/**
 * Delete inquiry
 */
async function handleDelete(req, res, id) {
  try {
    const user = await validateAuth(req);
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: { listing: { select: { ownerId: true } } }
    });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'INQUIRY_NOT_FOUND',
        code: 404
      });
    }

    // Only inquirer or listing owner can delete
    const isInquirer = inquiry.userId === user.id;
    const isListingOwner = inquiry.listing.ownerId === user.id;

    if (!isInquirer && !isListingOwner && user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        code: 403
      });
    }

    await prisma.inquiry.delete({
      where: { id }
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DELETE_INQUIRY',
        resource: 'inquiry',
        resourceId: id,
        listingId: inquiry.listingId
      }
    });

    return res.json({
      success: true,
      message: 'Inquiry deleted'
    });
  } catch (error) {
    console.error('[Inquiry DELETE]', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      code: 500
    });
  }
}
