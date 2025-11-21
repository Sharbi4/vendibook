/**
 * GET /api/payouts - List payout accounts (temporary open endpoint)
 * POST /api/payouts - Upsert payout account for a user
 */

import { sql, bootstrapUsersTable, bootstrapUserPayoutAccountsTable } from '../../src/api/db.js';

let bootstrapPromise;

function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = Promise.all([
      bootstrapUsersTable(),
      bootstrapUserPayoutAccountsTable()
    ]);
  }
  return bootstrapPromise;
}

const TEXT_FIELDS = ['stripe_connect_id', 'stripe_customer_id', 'plaid_account_id', 'plaid_status'];
const TIMESTAMP_FIELDS = ['last_payout_date'];

function normalizeBoolean(value) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(normalized)) return true;
    if (['false', '0', 'no', 'n'].includes(normalized)) return false;
  }
  return undefined;
}

function normalizeTimestamp(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function normalizePayload(body = {}) {
  const userId = body.userId || body.user_id;
  const payload = { userId };

  TEXT_FIELDS.forEach((field) => {
    const camel = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    const val = body[field] ?? body[camel];
    if (val !== undefined) {
      payload[field] = val === null ? null : String(val);
    }
  });

  TIMESTAMP_FIELDS.forEach((field) => {
    const camel = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    const val = body[field] ?? body[camel];
    const normalized = normalizeTimestamp(val);
    if (normalized !== undefined) {
      payload[field] = normalized;
    }
  });

  const payoutEnabledVal = body.payoutEnabled ?? body.payout_enabled;
  const normalizedBool = normalizeBoolean(payoutEnabledVal);
  if (normalizedBool !== undefined) {
    payload.payout_enabled = normalizedBool;
  }

  return payload;
}

async function handlePost(req, res) {
  const payload = normalizePayload(req.body || {});

  if (!payload.userId) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request',
      message: 'userId is required to upsert payout accounts'
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
      INSERT INTO user_payout_accounts (
        user_id,
        stripe_connect_id,
        stripe_customer_id,
        plaid_account_id,
        plaid_status,
        payout_enabled,
        last_payout_date
      ) VALUES (
        ${payload.userId},
        ${payload.stripe_connect_id ?? null},
        ${payload.stripe_customer_id ?? null},
        ${payload.plaid_account_id ?? null},
        ${payload.plaid_status ?? null},
        ${payload.payout_enabled ?? false},
        ${payload.last_payout_date ?? null}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        stripe_connect_id = COALESCE(EXCLUDED.stripe_connect_id, user_payout_accounts.stripe_connect_id),
        stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, user_payout_accounts.stripe_customer_id),
        plaid_account_id = COALESCE(EXCLUDED.plaid_account_id, user_payout_accounts.plaid_account_id),
        plaid_status = COALESCE(EXCLUDED.plaid_status, user_payout_accounts.plaid_status),
        payout_enabled = COALESCE(EXCLUDED.payout_enabled, user_payout_accounts.payout_enabled),
        last_payout_date = COALESCE(EXCLUDED.last_payout_date, user_payout_accounts.last_payout_date),
        updated_at = NOW()
      RETURNING *;
    `;

    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    console.error('Failed to upsert payout account:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to upsert payout account'
    });
  }
}

async function handleGet(req, res) {
  try {
    const rows = await sql`SELECT * FROM user_payout_accounts ORDER BY created_at DESC`;
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Failed to fetch payout accounts:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to fetch payout accounts'
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
      message: 'Failed to initialize payout accounts subsystem'
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
