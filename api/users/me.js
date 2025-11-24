/**
 * GET/POST /api/users/me - Fetch current user by Clerk ID
 */

import { sql, bootstrapUsersTable } from '../../src/api/db.js';
import { requireClerkUserId } from '../_clerk.js';

let bootstrapPromise;

function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapUsersTable();
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
      message: 'Failed to initialize users table'
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
    const [user] = await sql`SELECT * FROM users WHERE clerk_id = ${clerkId} LIMIT 1`;

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'User not found. POST to /api/users to register this clerkId.'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to fetch user'
    });
  }
}
