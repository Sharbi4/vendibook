/**
 * GET/POST /api/social/me - Fetch social links for current user via Clerk ID
 */

import { sql, bootstrapUsersTable, bootstrapUserSocialLinksTable } from '../../src/api/db.js';
import { requireClerkUserId } from '../_clerk.js';

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

  let clerkId;
  try {
    clerkId = requireClerkUserId(req);
  } catch (authError) {
    return res.status(authError.statusCode || 401).json({
      success: false,
      error: 'Unauthorized',
      message: authError.message || 'Authentication required'
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
