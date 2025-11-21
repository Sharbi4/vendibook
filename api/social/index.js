/**
 * GET /api/social - List all social link records (temporary open endpoint)
 * POST /api/social - Upsert social links for a given user
 */

import { sql, bootstrapUsersTable, bootstrapUserSocialLinksTable } from '../../src/api/db.js';

let bootstrapPromise;

function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = Promise.all([
      bootstrapUsersTable(),
      bootstrapUserSocialLinksTable()
    ]);
  }
  return bootstrapPromise;
}

const SOCIAL_FIELDS = ['instagram_url', 'tiktok_url', 'youtube_url', 'facebook_url', 'website_url'];

function normalizePayload(body = {}) {
  const userId = body.userId || body.user_id;
  const payload = { userId };

  SOCIAL_FIELDS.forEach((field) => {
    const camel = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    const val = body[field] ?? body[camel];
    if (val !== undefined && val !== null && val !== '') {
      payload[field] = String(val);
    }
  });

  return payload;
}

async function handlePost(req, res) {
  const payload = normalizePayload(req.body || {});

  if (!payload.userId) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request',
      message: 'userId is required to upsert social links'
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
      INSERT INTO user_social_links (
        user_id,
        instagram_url,
        tiktok_url,
        youtube_url,
        facebook_url,
        website_url
      ) VALUES (
        ${payload.userId},
        ${payload.instagram_url ?? null},
        ${payload.tiktok_url ?? null},
        ${payload.youtube_url ?? null},
        ${payload.facebook_url ?? null},
        ${payload.website_url ?? null}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        instagram_url = COALESCE(EXCLUDED.instagram_url, user_social_links.instagram_url),
        tiktok_url = COALESCE(EXCLUDED.tiktok_url, user_social_links.tiktok_url),
        youtube_url = COALESCE(EXCLUDED.youtube_url, user_social_links.youtube_url),
        facebook_url = COALESCE(EXCLUDED.facebook_url, user_social_links.facebook_url),
        website_url = COALESCE(EXCLUDED.website_url, user_social_links.website_url),
        updated_at = NOW()
      RETURNING *;
    `;

    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    console.error('Failed to upsert user social links:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to upsert social links'
    });
  }
}

async function handleGet(req, res) {
  try {
    const rows = await sql`SELECT * FROM user_social_links ORDER BY created_at DESC`;
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Failed to fetch user social links:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to fetch social links'
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
      message: 'Failed to initialize user social links subsystem'
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
