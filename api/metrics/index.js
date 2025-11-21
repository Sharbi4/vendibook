/**
 * GET /api/metrics - List user metrics (temporary open endpoint)
 * POST /api/metrics - Upsert metrics for a user
 */

import { sql, bootstrapUsersTable, bootstrapUserMetricsTable } from '../../src/api/db.js';

let bootstrapPromise;

function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = Promise.all([
      bootstrapUsersTable(),
      bootstrapUserMetricsTable()
    ]);
  }
  return bootstrapPromise;
}

const NUMERIC_FIELDS = ['rating_average'];
const INTEGER_FIELDS = ['rating_count', 'reviews_written', 'reviews_received', 'followers', 'following'];

function normalizeNumber(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
}

function normalizeInteger(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return undefined;
  return Math.trunc(parsed);
}

function normalizeBadges(value) {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => (item === undefined || item === null ? null : String(item).trim()))
      .filter((item) => item && item.length > 0);
    return cleaned;
  }
  if (typeof value === 'string') {
    const cleaned = value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    return cleaned;
  }
  return undefined;
}

function normalizePayload(body = {}) {
  const userId = body.userId || body.user_id;
  const payload = { userId };

  NUMERIC_FIELDS.forEach((field) => {
    const camel = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    const val = body[field] ?? body[camel];
    const normalized = normalizeNumber(val);
    if (normalized !== undefined) {
      payload[field] = normalized;
    }
  });

  INTEGER_FIELDS.forEach((field) => {
    const camel = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    const val = body[field] ?? body[camel];
    const normalized = normalizeInteger(val);
    if (normalized !== undefined) {
      payload[field] = normalized;
    }
  });

  const badges = normalizeBadges(body.badges);
  if (badges !== undefined) {
    payload.badges = badges;
  }

  return payload;
}

async function handlePost(req, res) {
  const payload = normalizePayload(req.body || {});

  if (!payload.userId) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request',
      message: 'userId is required to upsert metrics'
    });
  }

  try {
    const [user] = await sql`SELECT id FROM users WHERE id = ${payload.userId} LIMIT 1`;

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'No user found for the provided userId'
      });
    }

    const [record] = await sql`
      INSERT INTO user_metrics (
        user_id,
        rating_average,
        rating_count,
        reviews_written,
        reviews_received,
        followers,
        following,
        badges
      ) VALUES (
        ${payload.userId},
        ${payload.rating_average ?? 0},
        ${payload.rating_count ?? 0},
        ${payload.reviews_written ?? 0},
        ${payload.reviews_received ?? 0},
        ${payload.followers ?? 0},
        ${payload.following ?? 0},
        ${payload.badges ?? []}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        rating_average = COALESCE(EXCLUDED.rating_average, user_metrics.rating_average),
        rating_count = COALESCE(EXCLUDED.rating_count, user_metrics.rating_count),
        reviews_written = COALESCE(EXCLUDED.reviews_written, user_metrics.reviews_written),
        reviews_received = COALESCE(EXCLUDED.reviews_received, user_metrics.reviews_received),
        followers = COALESCE(EXCLUDED.followers, user_metrics.followers),
        following = COALESCE(EXCLUDED.following, user_metrics.following),
        badges = COALESCE(EXCLUDED.badges, user_metrics.badges),
        updated_at = NOW()
      RETURNING *;
    `;

    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    console.error('Failed to upsert user metrics:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to upsert user metrics'
    });
  }
}

async function handleGet(req, res) {
  try {
    const rows = await sql`SELECT * FROM user_metrics ORDER BY created_at DESC`;
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Failed to fetch user metrics:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to fetch user metrics'
    });
  }
}

export default async function handler(req, res) {
  try {
    await ensureBootstrap();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to initialize user metrics subsystem'
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
