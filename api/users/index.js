/**
 * GET /api/users - List users (temporary admin endpoint)
 * POST /api/users - Upsert user by clerk ID
 */

import { sql, bootstrapUsersTable } from '../../src/api/db.js';

let bootstrapPromise;

function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapUsersTable();
  }
  return bootstrapPromise;
}

function normalizeUserPayload(body = {}) {
  const clerkId = body.clerkId || body.clerk_id;
  const email = body.email || null;
  const firstName = body.firstName || body.first_name || null;
  const lastName = body.lastName || body.last_name || null;
  const businessName = body.businessName || body.business_name || null;
  const displayName = body.displayName || body.display_name || businessName || [firstName, lastName].filter(Boolean).join(' ').trim() || null;
  const phone = body.phone || null;
  const city = body.city || null;
  const state = body.state || null;
  const role = body.role || 'renter';

  return {
    clerkId,
    email,
    firstName,
    lastName,
    businessName,
    displayName,
    phone,
    city,
    state,
    role
  };
}

async function handlePost(req, res) {
  const payload = normalizeUserPayload(req.body || {});

  if (!payload.clerkId) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request',
      message: 'clerkId is required'
    });
  }

  try {
    const [user] = await sql`
      INSERT INTO users (
        clerk_id,
        email,
        first_name,
        last_name,
        display_name,
        business_name,
        phone,
        city,
        state,
        role
      ) VALUES (
        ${payload.clerkId},
        ${payload.email},
        ${payload.firstName},
        ${payload.lastName},
        ${payload.displayName},
        ${payload.businessName},
        ${payload.phone},
        ${payload.city},
        ${payload.state},
        ${payload.role}
      )
      ON CONFLICT (clerk_id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        display_name = EXCLUDED.display_name,
        business_name = EXCLUDED.business_name,
        phone = EXCLUDED.phone,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        updated_at = NOW()
      RETURNING *;
    `;

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Failed to upsert user:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to upsert user'
    });
  }
}

async function handleGet(req, res) {
  try {
    const users = await sql`SELECT * FROM users ORDER BY created_at DESC`;
    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to fetch users'
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
      message: 'Failed to initialize users table'
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
