import {
  ensureNotificationsBootstrap,
  createNotification
} from './shared.js';

async function safeNotify(callback, context) {
  try {
    await ensureNotificationsBootstrap();
    await callback();
  } catch (error) {
    console.error('[notifications] Failed to dispatch notification', context, error);
  }
}

export async function notifyNewMessage(thread, message) {
  if (!thread || !message) return;
  const recipients = [thread.hostUserId, thread.renterUserId].filter(
    userId => userId && userId !== message.senderUserId
  );

  await safeNotify(async () => {
    await Promise.all(
      recipients.map(userId =>
        createNotification({
          userId,
          type: 'message',
          title: thread.listing?.title || 'New message',
          body: message.body,
          bookingId: thread.booking?.id || thread.bookingId || null,
          threadId: thread.id
        })
      )
    );
  }, { event: 'notifyNewMessage', threadId: thread.id });
}

export async function notifyBookingCreated(booking) {
  if (!booking) return;
  await safeNotify(async () => {
    if (booking.host_user_id) {
      await createNotification({
        userId: booking.host_user_id,
        type: 'booking',
        title: 'New booking request',
        body: `Booking ${booking.id} created`,
        bookingId: booking.id
      });
    }
    if (booking.renter_user_id) {
      await createNotification({
        userId: booking.renter_user_id,
        type: 'booking',
        title: 'Booking submitted',
        body: `Your booking ${booking.id} is pending`,
        bookingId: booking.id
      });
    }
  }, { event: 'notifyBookingCreated', bookingId: booking?.id });
}

export async function notifyBookingStatusChanged(booking) {
  if (!booking) return;
  await safeNotify(async () => {
    const targets = [booking.host_user_id, booking.renter_user_id].filter(Boolean);
    await Promise.all(
      targets.map(userId =>
        createNotification({
          userId,
          type: 'booking',
          title: `Booking ${booking.status}`,
          body: `Booking ${booking.id} is now ${booking.status}`,
          bookingId: booking.id
        })
      )
    );
  }, { event: 'notifyBookingStatusChanged', bookingId: booking?.id });
}

export async function notifyBookingCancelled(booking) {
  if (!booking) return;
  await safeNotify(async () => {
    const targets = [booking.host_user_id, booking.renter_user_id].filter(Boolean);
    await Promise.all(
      targets.map(userId =>
        createNotification({
          userId,
          type: 'cancellation',
          title: 'Booking cancelled',
          body: `Booking ${booking.id} was cancelled`,
          bookingId: booking.id
        })
      )
    );
  }, { event: 'notifyBookingCancelled', bookingId: booking?.id });
}
