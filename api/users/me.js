/**
 * GET/PATCH /api/users/me - Temporary current-user endpoint (no auth wired)
 */

import { sql, bootstrapUsersTable } from '../../src/api/db.js';

let bootstrapPromise;
const DEMO_FALLBACK_CLERK_ID = 'demo-host-profile-placeholder';

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

function extractUserId(req) {
  return (
    req.query?.userId ||
    req.query?.user_id ||
    req.body?.userId ||
    req.body?.user_id ||
    req.headers?.['x-user-id'] ||
    null
  );
}

async function getOrCreateDemoUser() {
  const [existing] = await sql`SELECT * FROM users WHERE clerk_id = ${DEMO_FALLBACK_CLERK_ID} LIMIT 1`;
  if (existing) {
    return existing;
  }

  const [inserted] = await sql`
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
      role,
      tagline,
      bio,
      service_area_description,
      cuisines
    ) VALUES (
      ${DEMO_FALLBACK_CLERK_ID},
      'host@example.com',
      'Demo',
      'Host',
      'Demo Host',
      'Vendibook Demo Host',
      '(480) 555-0199',
      'Phoenix',
      'AZ',
      'host',
      'Mobile entrepreneur',
      'We bring flavor-forward food truck experiences across the Southwest.',
      'Serving Phoenix, Scottsdale, and Tucson activations.',
      'Sonoran tacos, cafecito, churros'
    )
    RETURNING *;
  `;

  return inserted;
}

async function fetchUserByIdentifiers({ userId, clerkId, allowDemoFallback }) {
  if (userId) {
    const [byId] = await sql`SELECT * FROM users WHERE id = ${userId} LIMIT 1`;
    if (byId) return byId;
  }

  if (clerkId) {
    const [byClerk] = await sql`SELECT * FROM users WHERE clerk_id = ${clerkId} LIMIT 1`;
    if (byClerk) return byClerk;
  }

  if (allowDemoFallback) {
    return getOrCreateDemoUser();
  }

  return null;
}

function sanitizeString(value) {
  if (value === undefined || value === null) return undefined;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
}

async function handleGet(req, res) {
  const userId = extractUserId(req);
  const clerkId = extractClerkId(req);
  const allowDemoFallback = req.query?.demo === 'true' || (!userId && !clerkId);

  const user = await fetchUserByIdentifiers({ userId, clerkId, allowDemoFallback });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'Not found',
      message: 'User not found. Include a userId or clerkId, or enable demo mode.'
    });
  }

  return res.status(200).json({ success: true, data: user });
}

async function handlePatch(req, res) {
  const userId = extractUserId(req);
  const clerkId = extractClerkId(req);

  if (!userId && !clerkId) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request',
      message: 'Provide userId or clerkId to update the profile.'
    });
  }

  const user = await fetchUserByIdentifiers({ userId, clerkId, allowDemoFallback: true });

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const updates = {
    display_name: sanitizeString(req.body?.displayName ?? req.body?.display_name),
    first_name: sanitizeString(req.body?.firstName ?? req.body?.first_name),
    last_name: sanitizeString(req.body?.lastName ?? req.body?.last_name),
    business_name: sanitizeString(req.body?.businessName ?? req.body?.business_name),
    phone: sanitizeString(req.body?.phone),
    city: sanitizeString(req.body?.city),
    state: sanitizeString(req.body?.state),
    tagline: sanitizeString(req.body?.tagline),
    bio: sanitizeString(req.body?.bio),
    service_area_description: sanitizeString(req.body?.serviceAreaDescription ?? req.body?.service_area_description),
    cuisines: sanitizeString(req.body?.cuisines)
  };

  const setFragments = [];
  const values = [];
  let index = 1;

  for (const [column, value] of Object.entries(updates)) {
    if (value !== undefined) {
      setFragments.push(`${column} = $${index}`);
      values.push(value);
      index += 1;
    }
  }

  if (!setFragments.length) {
    return res.status(400).json({ success: false, error: 'No updates provided' });
  }

  setFragments.push(`updated_at = NOW()`);

  const identifierColumn = userId ? 'id' : 'clerk_id';
  const identifierValue = userId || clerkId;

  const updateQuery = `
    UPDATE users
    SET ${setFragments.join(', ')}
    WHERE ${identifierColumn} = $${index}
    RETURNING *;
  `;

  const [updated] = await sql.unsafe(updateQuery, [...values, identifierValue]);

  return res.status(200).json({ success: true, data: updated });
}

export default async function handler(req, res) {
  if (!['GET', 'PATCH'].includes(req.method)) {
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

  try {
    if (req.method === 'GET') {
      return await handleGet(req, res);
    }

    if (req.method === 'PATCH') {
      // TODO: Restrict updates to authenticated user once auth is wired.
      return await handlePatch(req, res);
    }
  } catch (error) {
    console.error('users/me handler failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to process request'
    });
  }
}
