import {
  sql,
  bootstrapMessageThreadsTable,
  bootstrapMessagesTable,
  bootstrapBookingsTable,
  bootstrapUsersTable
} from '../db.js';

let messagingBootstrapPromise;

export function ensureMessagingBootstrap() {
  if (!messagingBootstrapPromise) {
    messagingBootstrapPromise = (async () => {
      await bootstrapUsersTable();
      await bootstrapBookingsTable();
      await bootstrapMessageThreadsTable();
      await bootstrapMessagesTable();
    })().catch(error => {
      messagingBootstrapPromise = undefined;
      console.error('Failed to bootstrap messaging subsystem:', error);
      throw error;
    });
  }
  return messagingBootstrapPromise;
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

const THREAD_SELECT = `
  SELECT
    t.id,
    t.booking_id,
    t.host_user_id,
    t.renter_user_id,
    t.last_message_at,
    t.last_message_preview,
    t.host_unread_count,
    t.renter_unread_count,
    t.created_at,
    t.updated_at,
    h.display_name AS host_display_name,
    h.email AS host_email,
    h.first_name AS host_first_name,
    h.last_name AS host_last_name,
    r.display_name AS renter_display_name,
    r.email AS renter_email,
    r.first_name AS renter_first_name,
    r.last_name AS renter_last_name,
    b.id AS booking_ref_id,
    b.listing_id AS booking_listing_id,
    b.status AS booking_status
  FROM message_threads t
  JOIN users h ON h.id = t.host_user_id
  JOIN users r ON r.id = t.renter_user_id
  LEFT JOIN bookings b ON b.id = t.booking_id
`;

const MESSAGE_SELECT = `
  SELECT
    m.id,
    m.thread_id,
    m.sender_user_id,
    m.body,
    m.message_type,
    m.is_read,
    m.created_at,
    m.updated_at,
    u.display_name AS sender_display_name,
    u.email AS sender_email,
    u.first_name AS sender_first_name,
    u.last_name AS sender_last_name
  FROM messages m
  JOIN users u ON u.id = m.sender_user_id
`;

export function parsePagination(query = {}) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  return {
    page,
    limit,
    offset: (page - 1) * limit
  };
}

export async function fetchThreadById(threadId) {
  if (!threadId) {
    return null;
  }
  const rows = await sql.unsafe(`${THREAD_SELECT} WHERE t.id = $1 LIMIT 1`, [threadId]);
  if (!rows.length) {
    return null;
  }
  return formatThreadRow(rows[0]);
}

export async function listThreads({ userId, role, pagination }) {
  const filters = [];
  const params = [];

  if (userId) {
    if (role === 'host') {
      filters.push(`t.host_user_id = $${params.length + 1}`);
      params.push(userId);
    } else if (role === 'renter') {
      filters.push(`t.renter_user_id = $${params.length + 1}`);
      params.push(userId);
    } else {
      filters.push(`(t.host_user_id = $${params.length + 1} OR t.renter_user_id = $${params.length + 2})`);
      params.push(userId, userId);
    }
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const limitPlaceholder = `$${params.length + 1}`;
  const offsetPlaceholder = `$${params.length + 2}`;

  const rows = await sql.unsafe(
    `${THREAD_SELECT} ${whereClause} ORDER BY COALESCE(t.last_message_at, t.created_at) DESC LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
    [...params, pagination.limit, pagination.offset]
  );

  const formatted = rows.map(formatThreadRow);

  const countRows = await sql.unsafe(
    `SELECT COUNT(*)::int AS total FROM message_threads t ${whereClause}`,
    params
  );

  const total = countRows[0]?.total || 0;
  return {
    threads: formatted,
    total
  };
}

export async function findOrCreateThread({ bookingId = null, hostUserId, renterUserId }) {
  if (!hostUserId || !renterUserId) {
    throw createHttpError(400, 'hostUserId and renterUserId are required to create a thread');
  }
  if (hostUserId === renterUserId) {
    throw createHttpError(400, 'host and renter must be different users');
  }

  let existing = null;

  if (bookingId) {
    existing = await fetchThreadByBookingId(bookingId);
  }

  if (!existing) {
    existing = await fetchThreadByParticipants(hostUserId, renterUserId, bookingId);
  }

  if (existing) {
    return existing;
  }

  const [inserted] = await sql`
    INSERT INTO message_threads (
      booking_id,
      host_user_id,
      renter_user_id
    ) VALUES (
      ${bookingId},
      ${hostUserId},
      ${renterUserId}
    )
    RETURNING id;
  `;

  return fetchThreadById(inserted.id);
}

async function fetchThreadByBookingId(bookingId) {
  if (!bookingId) {
    return null;
  }
  const rows = await sql.unsafe(`${THREAD_SELECT} WHERE t.booking_id = $1 LIMIT 1`, [bookingId]);
  return rows.length ? formatThreadRow(rows[0]) : null;
}

async function fetchThreadByParticipants(hostUserId, renterUserId, bookingId) {
  if (!hostUserId || !renterUserId) {
    return null;
  }
  const params = [hostUserId, renterUserId];
  let whereClause = 'WHERE t.host_user_id = $1 AND t.renter_user_id = $2';
  if (bookingId === null) {
    whereClause += ' AND t.booking_id IS NULL';
  }
  const rows = await sql.unsafe(`${THREAD_SELECT} ${whereClause} ORDER BY t.created_at DESC LIMIT 1`, params);
  return rows.length ? formatThreadRow(rows[0]) : null;
}

export async function fetchBookingParticipants(bookingId) {
  if (!bookingId) {
    return null;
  }
  const [booking] = await sql`
    SELECT id, host_user_id, renter_user_id
    FROM bookings
    WHERE id = ${bookingId}
    LIMIT 1;
  `;
  return booking || null;
}

export async function insertMessage({ threadId, senderUserId, body, messageType = 'text' }) {
  const trimmedBody = normalizeBody(body);
  const [inserted] = await sql`
    INSERT INTO messages (thread_id, sender_user_id, body, message_type)
    VALUES (${threadId}, ${senderUserId}, ${trimmedBody}, ${messageType})
    RETURNING id;
  `;
  return fetchMessageById(inserted.id);
}

export async function fetchMessagesForThread(threadId, pagination, order = 'ASC') {
  const direction = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  const rows = await sql.unsafe(
    `${MESSAGE_SELECT} WHERE m.thread_id = $1 ORDER BY m.created_at ${direction} LIMIT $2 OFFSET $3`,
    [threadId, pagination.limit, pagination.offset]
  );
  const [{ total = 0 } = {}] = await sql`
    SELECT COUNT(*)::int AS total
    FROM messages
    WHERE thread_id = ${threadId};
  `;
  return {
    messages: rows.map(formatMessageRow),
    total
  };
}

export async function fetchMessageById(messageId) {
  const rows = await sql.unsafe(`${MESSAGE_SELECT} WHERE m.id = $1 LIMIT 1`, [messageId]);
  return rows.length ? formatMessageRow(rows[0]) : null;
}

export async function updateThreadAfterMessage(thread, senderUserId, body) {
  const preview = truncatePreview(body);
  const isHostSender = senderUserId === thread.hostUserId;
  const rows = await sql`
    UPDATE message_threads
    SET
      last_message_at = NOW(),
      last_message_preview = ${preview},
      host_unread_count = CASE WHEN ${isHostSender} THEN 0 ELSE host_unread_count + 1 END,
      renter_unread_count = CASE WHEN ${isHostSender} THEN renter_unread_count + 1 ELSE 0 END,
      updated_at = NOW()
    WHERE id = ${thread.id}
    RETURNING *;
  `;
  return rows.length ? formatThreadRow(rows[0]) : thread;
}

export async function markThreadAsRead(thread, readerUserId) {
  const isHostReader = readerUserId === thread.hostUserId;
  await sql`
    UPDATE messages
    SET is_read = TRUE, updated_at = NOW()
    WHERE thread_id = ${thread.id} AND sender_user_id <> ${readerUserId} AND is_read = FALSE;
  `;
  const rows = await sql`
    UPDATE message_threads
    SET
      host_unread_count = CASE WHEN ${isHostReader} THEN 0 ELSE host_unread_count END,
      renter_unread_count = CASE WHEN ${isHostReader} THEN renter_unread_count ELSE 0 END,
      updated_at = NOW()
    WHERE id = ${thread.id}
    RETURNING *;
  `;
  return rows.length ? formatThreadRow(rows[0]) : thread;
}

function normalizeBody(body) {
  if (!body || !String(body).trim()) {
    throw createHttpError(400, 'Message body is required');
  }
  return String(body).trim();
}

function truncatePreview(text) {
  const content = String(text || '').trim();
  if (content.length <= 280) {
    return content;
  }
  return `${content.slice(0, 277)}...`;
}

function formatThreadRow(row) {
  return {
    id: row.id,
    bookingId: row.booking_id,
    hostUserId: row.host_user_id,
    renterUserId: row.renter_user_id,
    lastMessageAt: row.last_message_at,
    lastMessagePreview: row.last_message_preview,
    hostUnreadCount: toNumber(row.host_unread_count),
    renterUnreadCount: toNumber(row.renter_unread_count),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    host: row.host_user_id
      ? {
          id: row.host_user_id,
          displayName: row.host_display_name,
          email: row.host_email,
          firstName: row.host_first_name,
          lastName: row.host_last_name
        }
      : null,
    renter: row.renter_user_id
      ? {
          id: row.renter_user_id,
          displayName: row.renter_display_name,
          email: row.renter_email,
          firstName: row.renter_first_name,
          lastName: row.renter_last_name
        }
      : null,
    booking:
      row.booking_ref_id
        ? {
            id: row.booking_ref_id,
            listingId: row.booking_listing_id,
            status: row.booking_status
          }
        : null
  };
}

function formatMessageRow(row) {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderUserId: row.sender_user_id,
    body: row.body,
    messageType: row.message_type,
    isRead: row.is_read,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sender: row.sender_user_id
      ? {
          id: row.sender_user_id,
          displayName: row.sender_display_name,
          email: row.sender_email,
          firstName: row.sender_first_name,
          lastName: row.sender_last_name
        }
      : null
  };
}

function toNumber(value) {
  if (value === null || value === undefined) {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
