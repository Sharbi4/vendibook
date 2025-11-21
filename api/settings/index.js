/**
 * GET /api/settings - List all user settings (temporary open endpoint)
 * POST /api/settings - Upsert settings for a given user
 */

import { sql, bootstrapUserSettingsTable, bootstrapUsersTable } from '../../src/api/db.js';

let bootstrapPromise;

function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = Promise.all([
      bootstrapUsersTable(),
      bootstrapUserSettingsTable()
    ]);
  }
  return bootstrapPromise;
}

const BOOLEAN_FIELDS = ['notifications_enabled'];
const INTEGER_FIELDS = ['search_radius_miles', 'support_contact_events'];
const TIMESTAMP_FIELDS = ['subscription_start_date', 'subscription_pause_date'];
const TEXT_FIELDS = ['onboarding_step', 'subscription_plan', 'subscription_status', 'account_status'];

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

function normalizeInteger(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return undefined;
  return parseInt(parsed, 10);
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

  BOOLEAN_FIELDS.forEach((field) => {
    const camel = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    const val = body[field] ?? body[camel];
    const normalized = normalizeBoolean(val);
    if (normalized !== undefined) {
      payload[field] = normalized;
    }
  });

  INTEGER_FIELDS.forEach((field) => {
    const camel = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    const val = body[field] ?? body[camel];
    const normalized = normalizeInteger(val);
    if (normalized !== undefined) {
      payload[field] = normalized;
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

  TEXT_FIELDS.forEach((field) => {
    const camel = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    const val = body[field] ?? body[camel];
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
      message: 'userId is required to upsert settings'
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

    const [settings] = await sql`
      INSERT INTO user_settings (
        user_id,
        notifications_enabled,
        search_radius_miles,
        onboarding_step,
        subscription_plan,
        subscription_status,
        subscription_start_date,
        subscription_pause_date,
        account_status,
        support_contact_events
      ) VALUES (
        ${payload.userId},
        ${payload.notifications_enabled ?? true},
        ${payload.search_radius_miles ?? 25},
        ${payload.onboarding_step ?? null},
        ${payload.subscription_plan ?? null},
        ${payload.subscription_status ?? null},
        ${payload.subscription_start_date ?? null},
        ${payload.subscription_pause_date ?? null},
        ${payload.account_status ?? 'active'},
        ${payload.support_contact_events ?? 0}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        notifications_enabled = COALESCE(EXCLUDED.notifications_enabled, user_settings.notifications_enabled),
        search_radius_miles = COALESCE(EXCLUDED.search_radius_miles, user_settings.search_radius_miles),
        onboarding_step = COALESCE(EXCLUDED.onboarding_step, user_settings.onboarding_step),
        subscription_plan = COALESCE(EXCLUDED.subscription_plan, user_settings.subscription_plan),
        subscription_status = COALESCE(EXCLUDED.subscription_status, user_settings.subscription_status),
        subscription_start_date = COALESCE(EXCLUDED.subscription_start_date, user_settings.subscription_start_date),
        subscription_pause_date = COALESCE(EXCLUDED.subscription_pause_date, user_settings.subscription_pause_date),
        account_status = COALESCE(EXCLUDED.account_status, user_settings.account_status),
        support_contact_events = COALESCE(EXCLUDED.support_contact_events, user_settings.support_contact_events),
        updated_at = NOW()
      RETURNING *;
    `;

    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error('Failed to upsert user settings:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to upsert user settings'
    });
  }
}

async function handleGet(req, res) {
  try {
    const rows = await sql`SELECT * FROM user_settings ORDER BY created_at DESC`;
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Failed to fetch user settings:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to fetch user settings'
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
      message: 'Failed to initialize user settings subsystem'
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
