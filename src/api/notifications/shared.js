import {
  sql,
  bootstrapNotificationsTable,
  bootstrapUsersTable,
  bootstrapBookingsTable,
  bootstrapMessageThreadsTable
} from '../db.js';

let notificationsBootstrapPromise;

export function ensureNotificationsBootstrap() {
  if (!notificationsBootstrapPromise) {
    notificationsBootstrapPromise = (async () => {
      await bootstrapUsersTable();
      await bootstrapBookingsTable();
      await bootstrapMessageThreadsTable();
      await bootstrapNotificationsTable();
    })().catch(error => {
      notificationsBootstrapPromise = undefined;
      console.error('Failed to bootstrap notifications subsystem:', error);
      throw error;
    });
  }
  return notificationsBootstrapPromise;
}

export function extractClerkId(req) {
  const headers = req?.headers || {};
  return (
    headers['x-clerk-id'] ||
    headers['x-clerkid'] ||
    headers['clerk-id'] ||
    headers['clerkid'] ||
    req.body?.clerkId ||
    req.body?.clerk_id ||
    req.query?.clerkId ||
    req.query?.clerk_id ||
    null
  );
}

export async function resolveUserId({ userId, clerkId, label = 'user', required = true }) {
  if (userId) {
    return userId;
  }

  if (!clerkId) {
    if (required) {
      throw createHttpError(400, `Missing ${label} identifier`);
    }
    return null;
  }

  const [record] = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId} LIMIT 1`;
  if (!record) {
    throw createHttpError(404, `User not found for ${label}`);
  }

  return record.id;
}

export function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export function parsePagination(query = {}) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  return {
    page,
    limit,
    offset: (page - 1) * limit
  };
}

export async function createNotification({
  userId,
  type,
  title = null,
  body = null,
  bookingId = null,
  threadId = null
}) {
  if (!userId) {
    throw createHttpError(400, 'userId is required to create a notification');
  }
  if (!type) {
    throw createHttpError(400, 'type is required to create a notification');
  }

  const [inserted] = await sql`
    INSERT INTO notifications (
      user_id,
      type,
      title,
      body,
      booking_id,
      thread_id
    ) VALUES (
      ${userId},
      ${type},
      ${title},
      ${body},
      ${bookingId},
      ${threadId}
    )
    RETURNING *;
  `;

  return formatNotification(inserted);
}

export async function markNotificationsRead(userId, notificationIds = []) {
  if (!userId) {
    throw createHttpError(400, 'userId is required to mark notifications as read');
  }

  if (!notificationIds.length) {
    return { updated: 0, notifications: [] };
  }

  const rows = await sql`
    UPDATE notifications
    SET is_read = TRUE, updated_at = NOW()
    WHERE user_id = ${userId} AND id = ANY(${notificationIds})
    RETURNING *;
  `;

  return {
    updated: rows.length,
    notifications: rows.map(formatNotification)
  };
}

export async function markAllNotificationsRead(userId) {
  const rows = await sql`
    UPDATE notifications
    SET is_read = TRUE, updated_at = NOW()
    WHERE user_id = ${userId} AND is_read = FALSE
    RETURNING id;
  `;
  return rows.length;
}

export async function listNotifications(filters = {}, pagination = parsePagination({})) {
  const conditions = [];
  const params = [];

  if (filters.userId) {
    conditions.push(`n.user_id = $${params.length + 1}`);
    params.push(filters.userId);
  }

  if (filters.type) {
    conditions.push(`n.type = $${params.length + 1}`);
    params.push(filters.type);
  }

  if (filters.isRead !== undefined) {
    conditions.push(`n.is_read = $${params.length + 1}`);
    params.push(filters.isRead);
  }

  if (filters.bookingId) {
    conditions.push(`n.booking_id = $${params.length + 1}`);
    params.push(filters.bookingId);
  }

  if (filters.threadId) {
    conditions.push(`n.thread_id = $${params.length + 1}`);
    params.push(filters.threadId);
  }

  if (filters.since) {
    conditions.push(`n.created_at >= $${params.length + 1}`);
    params.push(filters.since);
  }

  if (filters.until) {
    conditions.push(`n.created_at <= $${params.length + 1}`);
    params.push(filters.until);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limitPlaceholder = `$${params.length + 1}`;
  const offsetPlaceholder = `$${params.length + 2}`;

  const rows = await sql.unsafe(
    `SELECT * FROM notifications n ${whereClause} ORDER BY n.created_at DESC LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
    [...params, pagination.limit, pagination.offset]
  );

  const [{ total = 0 } = {}] = await sql.unsafe(
    `SELECT COUNT(*)::int AS total FROM notifications n ${whereClause}`,
    params
  );

  return {
    notifications: rows.map(formatNotification),
    total
  };
}

export function formatNotification(row = {}) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    bookingId: row.booking_id,
    threadId: row.thread_id,
    isRead: row.is_read,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
*** End of File
