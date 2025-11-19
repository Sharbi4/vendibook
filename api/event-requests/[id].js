import { PrismaClient } from '@prisma/client';
import { validateAuth } from '../../_auth';

const prisma = new PrismaClient();

/**
 * GET /event-requests/{id} - Get event request details
 * PATCH /event-requests/{id} - Update event request status
 * DELETE /event-requests/{id} - Cancel event request
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
 * Get event request details
 */
async function handleGet(req, res, id) {
  try {
    const user = await validateAuth(req);
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const eventRequest = await prisma.eventRequest.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phoneNumber: true } },
        listing: { select: { id: true, title: true, ownerId: true } }
      }
    });

    if (!eventRequest) {
      return res.status(404).json({
        success: false,
        error: 'EVENT_REQUEST_NOT_FOUND',
        code: 404
      });
    }

    // Authorization: only requester, event pro, or admin
    const isRequester = eventRequest.userId === user.id;
    const isEventPro = eventRequest.listing.ownerId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isRequester && !isEventPro && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        code: 403
      });
    }

    return res.json({
      success: true,
      data: eventRequest
    });
  } catch (error) {
    console.error('[Event Request GET]', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      code: 500
    });
  }
}

/**
 * Update event request (approve/decline/complete)
 */
async function handleUpdate(req, res, id) {
  try {
    const user = await validateAuth(req);
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const { status, respondMessage } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'APPROVED', 'DECLINED', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
        code: 400
      });
    }

    const eventRequest = await prisma.eventRequest.findUnique({
      where: { id },
      include: { listing: { select: { ownerId: true } } }
    });

    if (!eventRequest) {
      return res.status(404).json({
        success: false,
        error: 'EVENT_REQUEST_NOT_FOUND',
        code: 404
      });
    }

    // Only event pro can approve/decline/complete
    if (eventRequest.listing.ownerId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Only the event pro can respond to requests',
        code: 403
      });
    }

    // Only requester can cancel
    if (status === 'CANCELLED' && eventRequest.userId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Only the requester can cancel an event request',
        code: 403
      });
    }

    // Validate status transitions
    const validTransitions = {
      'PENDING': ['APPROVED', 'DECLINED', 'CANCELLED'],
      'APPROVED': ['COMPLETED', 'DECLINED', 'CANCELLED'],
      'DECLINED': ['APPROVED', 'CANCELLED'],
      'COMPLETED': [],
      'CANCELLED': []
    };

    if (status && !validTransitions[eventRequest.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TRANSITION',
        message: `Cannot transition from ${eventRequest.status} to ${status}`,
        code: 400
      });
    }

    // Update event request
    const updated = await prisma.eventRequest.update({
      where: { id },
      data: {
        status: status || eventRequest.status,
        approvedAt: (status === 'APPROVED' || status === 'COMPLETED') ? new Date() : eventRequest.approvedAt
      }
    });

    // Notify requester
    const notificationType = {
      'APPROVED': 'EVENT_APPROVED',
      'DECLINED': 'EVENT_DECLINED',
      'COMPLETED': 'EVENT_COMPLETED'
    }[status];

    if (notificationType) {
      await prisma.notification.create({
        data: {
          userId: eventRequest.userId,
          type: notificationType,
          title: `Event Request ${status}`,
          message: `Your event request has been ${status.toLowerCase()}`,
          relatedId: eventRequest.id
        }
      });
    }

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_EVENT_REQUEST',
        resource: 'event_request',
        resourceId: id,
        listingId: eventRequest.listingId,
        changes: { status, respondMessage }
      }
    });

    return res.json({
      success: true,
      data: updated,
      message: `Event request ${status?.toLowerCase() || 'updated'}`
    });
  } catch (error) {
    console.error('[Event Request PATCH]', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      code: 500
    });
  }
}

/**
 * Delete/cancel event request
 */
async function handleDelete(req, res, id) {
  try {
    const user = await validateAuth(req);
    if (!user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

    const eventRequest = await prisma.eventRequest.findUnique({
      where: { id },
      include: { listing: { select: { ownerId: true } } }
    });

    if (!eventRequest) {
      return res.status(404).json({
        success: false,
        error: 'EVENT_REQUEST_NOT_FOUND',
        code: 404
      });
    }

    // Only requester or event pro can delete
    const isRequester = eventRequest.userId === user.id;
    const isEventPro = eventRequest.listing.ownerId === user.id;

    if (!isRequester && !isEventPro && user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        code: 403
      });
    }

    // Can't delete if completed
    if (eventRequest.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: 'CANNOT_DELETE',
        message: 'Cannot delete completed event requests',
        code: 400
      });
    }

    await prisma.eventRequest.delete({
      where: { id }
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CANCEL_EVENT_REQUEST',
        resource: 'event_request',
        resourceId: id,
        listingId: eventRequest.listingId
      }
    });

    return res.json({
      success: true,
      message: 'Event request cancelled'
    });
  } catch (error) {
    console.error('[Event Request DELETE]', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      code: 500
    });
  }
}
