/**
 * GET /api/verifications - List all verification records
 * POST /api/verifications - Upsert verification state for a user
 */

import { sql, bootstrapUsersTable, bootstrapUserVerificationsTable } from '../../src/api/db.js';

let bootstrapPromise;

function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = Promise.all([
      bootstrapUsersTable(),
      bootstrapUserVerificationsTable()
    ]);
  }
  return bootstrapPromise;
}

const BOOLEAN_FIELDS = ['id_verified', 'title_verified', 'notary_verified', 'insurance_verified'];
const TEXT_FIELDS = ['kyc_status', 'verification_level', 'notes'];

function normalizeBoolean(value) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowered = value.toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(lowered)) return true;
    if (['false', '0', 'no', 'n'].includes(lowered)) return false;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  return undefined;
}

function normalizePayload(body = {}) {
  const userId = body.userId || body.user_id;
  const payload = { userId };

  BOOLEAN_FIELDS.forEach((field) => {
    const camelField = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    const val = body[field] ?? body[camelField];
    const normalized = normalizeBoolean(val);
    if (normalized !== undefined) {
      payload[field] = normalized;
    }
  });

  TEXT_FIELDS.forEach((field) => {
    const camelField = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    const val = body[field] ?? body[camelField];
    if (val !== undefined) {
      payload[field] = typeof val === 'string' ? val : String(val);
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
      message: 'userId is required to upsert verification'
    });
  }

  try {
    const [user] = await sql`SELECT id FROM users WHERE id = ${payload.userId} LIMIT 1`;

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'No user exists with the provided userId'
      });
    }

    const [record] = await sql`
      INSERT INTO user_verifications (
        user_id,
        id_verified,
        title_verified,
        notary_verified,
        insurance_verified,
        kyc_status,
        verification_level,
        notes
      ) VALUES (
        ${payload.userId},
        ${payload.id_verified ?? false},
        ${payload.title_verified ?? false},
        ${payload.notary_verified ?? false},
        ${payload.insurance_verified ?? false},
        ${payload.kyc_status ?? null},
        ${payload.verification_level ?? null},
        ${payload.notes ?? null}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        id_verified = COALESCE(EXCLUDED.id_verified, user_verifications.id_verified),
        title_verified = COALESCE(EXCLUDED.title_verified, user_verifications.title_verified),
        notary_verified = COALESCE(EXCLUDED.notary_verified, user_verifications.notary_verified),
        insurance_verified = COALESCE(EXCLUDED.insurance_verified, user_verifications.insurance_verified),
        kyc_status = COALESCE(EXCLUDED.kyc_status, user_verifications.kyc_status),
        verification_level = COALESCE(EXCLUDED.verification_level, user_verifications.verification_level),
        notes = COALESCE(EXCLUDED.notes, user_verifications.notes),
        updated_at = NOW()
      RETURNING *;
    `;

    return res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Failed to upsert verification:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to upsert verification record'
    });
  }
}

async function handleGet(req, res) {
  try {
    const records = await sql`SELECT * FROM user_verifications ORDER BY created_at DESC`;
    return res.status(200).json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Failed to fetch verifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to fetch verification records'
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
      message: 'Failed to initialize verification table'
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
