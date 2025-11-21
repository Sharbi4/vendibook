/**
 * GET/POST /api/social/me - Fetch social links for current user via Clerk ID
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

function extractClerkId(req) {
  const headers = req.headers || {};
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

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await ensureBootstrap();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to initialize user social links subsystem'
    });
  }

  const clerkId = extractClerkId(req);

  if (!clerkId) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request',
      message: 'Missing clerkId. Provide via x-clerk-id header or request body.'
    });
  }

  try {
    const [user] = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId} LIMIT 1`;

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User not registered. POST to /api/users first.'
      });
    }

    const [record] = await sql`SELECT * FROM user_social_links WHERE user_id = ${user.id} LIMIT 1`;

    if (!record) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No social links found. POST to /api/social to add links.',
        userId: user.id
      });
    }

    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    console.error('Failed to fetch social links for current user:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to fetch social links'
    });
  }
}
