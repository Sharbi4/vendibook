/**
 * GET/POST /api/users/me - Fetch current user by Clerk ID
 */

import { sql, bootstrapUsersTable } from '../../src/api/db.js';

let bootstrapPromise;

function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapUsersTable();
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
      message: 'Failed to initialize users table'
    });
  }

  const clerkId = extractClerkId(req);

  if (!clerkId) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request',
      message: 'Missing clerkId. Include it in headers (x-clerk-id) or request body.'
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
