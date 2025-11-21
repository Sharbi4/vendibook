import {
  ensureMessagingBootstrap,
  extractClerkId,
  resolveUserId,
  parsePagination,
  listThreads,
  findOrCreateThread,
  fetchThreadById,
  fetchBookingParticipants,
  insertMessage,
  updateThreadAfterMessage,
  createHttpError
} from '../../src/api/messaging/shared.js';
// import { notifyNewMessage } from '../../src/api/notifications/hooks.js'; // TODO: enable after notification wiring

export default async function handler(req, res) {
  try {
    await ensureMessagingBootstrap();
  } catch (error) {
    console.error('Failed to initialize messaging subsystem:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to initialize messaging subsystem'
    });
  }

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

async function handlePost(req, res) {
  try {
    const body = req.body || {};
    const threadIdInput = body.threadId || body.thread_id;
    const bookingId = body.bookingId || body.booking_id || null;
    const messageType = (body.messageType || body.message_type || 'text').toString();
    const messageBody = body.body ?? body.content;

    let thread = null;

    let senderUserId = body.senderUserId || body.sender_user_id || null;
    const senderClerkId = body.senderClerkId || body.sender_clerk_id || extractClerkId(req);
    senderUserId = await resolveUserId({ userId: senderUserId, clerkId: senderClerkId, label: 'sender' });

    if (threadIdInput) {
      thread = await fetchThreadById(threadIdInput);
      if (!thread) {
        throw createHttpError(404, 'Thread not found');
      }
      if (senderUserId !== thread.hostUserId && senderUserId !== thread.renterUserId) {
        throw createHttpError(403, 'Sender must belong to this thread');
      }
    } else {
      let hostUserId = body.hostUserId || body.host_user_id || null;
      let renterUserId = body.renterUserId || body.renter_user_id || null;

      if (bookingId) {
        const booking = await fetchBookingParticipants(bookingId);
        if (!booking) {
          throw createHttpError(404, 'Booking not found');
        }
        hostUserId = booking.host_user_id;
        renterUserId = booking.renter_user_id;
      } else {
        const hostClerkId = body.hostClerkId || body.host_clerk_id;
        const renterClerkId = body.renterClerkId || body.renter_clerk_id;
        hostUserId = await resolveUserId({ userId: hostUserId, clerkId: hostClerkId, label: 'host' });
        renterUserId = await resolveUserId({ userId: renterUserId, clerkId: renterClerkId, label: 'renter' });
      }

      thread = await findOrCreateThread({
        bookingId,
        hostUserId,
        renterUserId
      });
    }

    const message = await insertMessage({
      threadId: thread.id,
      senderUserId,
      body: messageBody,
      messageType
    });

    const updatedThread = await updateThreadAfterMessage(thread, senderUserId, message.body);
    // TODO: notifyNewMessage(updatedThread, message);

    return res.status(201).json({
      success: true,
      data: {
        message,
        thread: updatedThread
      }
    });
  } catch (error) {
    return handleRouteError(res, error, 'Failed to create message');
  }
}

async function handleGet(req, res) {
  try {
    const pagination = parsePagination(req.query || {});
    const roleParam = String(req.query?.role || '').toLowerCase();
    const role = roleParam === 'host' || roleParam === 'renter' ? roleParam : null;

    let userId = req.query?.userId || req.query?.user_id || null;
    const filterClerkId = req.query?.clerkId || req.query?.clerk_id || extractClerkId(req);

    if (!userId && filterClerkId) {
      userId = await resolveUserId({ clerkId: filterClerkId, label: 'user filter' });
    }

    if (!userId) {
      throw createHttpError(400, 'userId or clerkId is required to list threads');
    }

    const { threads, total } = await listThreads({ userId, role, pagination });

    return res.status(200).json({
      success: true,
      data: threads,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.max(Math.ceil(total / pagination.limit), 1)
      }
    });
  } catch (error) {
    return handleRouteError(res, error, 'Failed to fetch message threads');
  }
}

function handleRouteError(res, error, fallbackMessage) {
  if (error?.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: fallbackMessage,
      message: error.message
    });
  }

  console.error(fallbackMessage, error);
  return res.status(500).json({
    success: false,
    error: 'Server error',
    message: fallbackMessage
  });
}
