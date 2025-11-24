/**
 * GET/POST /api/verifications/me - Fetch verification record for current user
 */

import { sql, bootstrapUsersTable, bootstrapUserVerificationsTable } from '../../src/api/db.js';

let bootstrapPromise;

async function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = Promise.all([
      bootstrapUsersTable(),
      bootstrapUserVerificationsTable()
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
      message: 'Failed to initialize verification subsystem'
    });
  }

  const clerkId = extractClerkId(req);

  if (!clerkId) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request',
      message: 'Missing clerkId. Provide it via x-clerk-id header or request body.'
    });
  }

  try {
    const [user] = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId} LIMIT 1`;

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'No user found for this clerkId. Register via /api/users before checking verification.'
      });
    }

    const [verification] = await sql`SELECT * FROM user_verifications WHERE user_id = ${user.id} LIMIT 1`;

    if (!verification) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No verification record yet. POST to /api/verifications to initialize verification for this user.',
        userId: user.id
      });
    }

    return res.status(200).json({
      success: true,
      data: verification
    });
  } catch (error) {
    console.error('Failed to fetch verification for current user:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to fetch verification record'
    });
  }
}
