import { PrismaClient } from '@prisma/client';
import { validateAuth } from '../../_auth';

const prisma = new PrismaClient();

/**
 * PATCH /documents/{id} - Verify/reject document (admin only)
 * DELETE /documents/{id} - Delete document
 */
export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    return handleUpdate(req, res, id);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  } else if (req.method === 'GET') {
    return handleGet(req, res, id);
  }

  res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });
}

/**
 * Get document details
 */
async function handleGet(req, res) {
  try {
    const user = await validateAuth(req);
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const document = await prisma.document.findUnique({
      where: { id }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'DOCUMENT_NOT_FOUND',
        code: 404
      });
    }

    // Authorization: only owner, listing owner, or admin
    if (
      document.userId !== user.id &&
      user.role !== 'ADMIN'
    ) {
      // Check if user is associated with listing
      if (document.listingId) {
        const listing = await prisma.hostListing.findUnique({
          where: { id: document.listingId },
          select: { ownerId: true }
        });
        if (listing?.ownerId !== user.id) {
          return res.status(403).json({ success: false, error: 'FORBIDDEN', code: 403 });
        }
      } else {
        return res.status(403).json({ success: false, error: 'FORBIDDEN', code: 403 });
      }
    }

    return res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('[Document GET]', error);
    return res.status(500).json({ success: false, error: 'INTERNAL_ERROR', code: 500 });
  }
}

/**
 * Verify or reject document (admin only)
 */
async function handleUpdate(req, res, id) {
  try {
    const user = await validateAuth(req);
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    // Admin only
    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Only admins can verify documents',
        code: 403
      });
    }

    const { status, metadata = {} } = req.body;

    // Validate status
    if (!['VERIFIED', 'REJECTED', 'EXPIRED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: 'Status must be VERIFIED, REJECTED, or EXPIRED',
        code: 400
      });
    }

    const document = await prisma.document.update({
      where: { id },
      data: {
        status,
        verifiedBy: user.id,
        verifiedAt: new Date(),
        metadata: {
          ...document.metadata,
          ...metadata,
          verifiedTimestamp: new Date().toISOString()
        }
      }
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'VERIFY_DOCUMENT',
        resource: 'document',
        resourceId: document.id,
        changes: { status, verifiedBy: user.id }
      }
    });

    // Send notification to document owner
    await prisma.notification.create({
      data: {
        userId: document.userId,
        type: status === 'VERIFIED' ? 'DOCUMENT_VERIFIED' : 'DOCUMENT_REJECTED',
        title: `Document ${status.toLowerCase()}`,
        message: `Your ${document.type.toLowerCase()} document has been ${status.toLowerCase()}`,
        relatedId: document.id
      }
    });

    return res.json({
      success: true,
      data: document,
      message: `Document marked as ${status}`
    });
  } catch (error) {
    console.error('[Document PATCH]', error);
    return res.status(500).json({ success: false, error: 'INTERNAL_ERROR', code: 500 });
  }
}

/**
 * Delete document
 */
async function handleDelete(req, res, id) {
  try {
    const user = await validateAuth(req);
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const document = await prisma.document.findUnique({
      where: { id },
      select: { userId: true, listingId: true }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'DOCUMENT_NOT_FOUND',
        code: 404
      });
    }

    // Only owner or admin can delete
    if (document.userId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        code: 403
      });
    }

    await prisma.document.delete({
      where: { id }
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DELETE_DOCUMENT',
        resource: 'document',
        resourceId: id,
        listingId: document.listingId
      }
    });

    return res.json({
      success: true,
      message: 'Document deleted'
    });
  } catch (error) {
    console.error('[Document DELETE]', error);
    return res.status(500).json({ success: false, error: 'INTERNAL_ERROR', code: 500 });
  }
}
