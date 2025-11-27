import { sql, bootstrapUserSettingsTable, bootstrapUsersTable } from '../../src/api/db.js';

let bootstrapPromise;

function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await bootstrapUsersTable();
      await bootstrapUserSettingsTable();
    })();
  }
  return bootstrapPromise;
}

function resolveUserId(req) {
  return (
    req.query?.userId ||
    req.query?.user_id ||
    req.body?.userId ||
    req.body?.user_id ||
    req.headers?.['x-user-id'] ||
    null
  );
}

async function fallbackUserId() {
  const [row] = await sql`SELECT id FROM users ORDER BY created_at ASC LIMIT 1`;
  return row?.id || null;
}

async function getOrCreateSettings(userId) {
  const [existing] = await sql`SELECT * FROM user_settings WHERE user_id = ${userId} LIMIT 1`;
  if (existing) {
    return existing;
  }

  const [inserted] = await sql`
    INSERT INTO user_settings (
      user_id,
      public_phone,
      service_radius_miles,
      willing_to_travel
    ) VALUES (
      ${userId},
      null,
      25,
      false
    )
    ON CONFLICT (user_id) DO NOTHING
    RETURNING *;
  `;

  if (inserted) {
    return inserted;
  }

  const [created] = await sql`SELECT * FROM user_settings WHERE user_id = ${userId} LIMIT 1`;
  return created;
}

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  return null;
}

async function handleGet(req, res) {
  let userId = resolveUserId(req);
  if (!userId) {
    userId = await fallbackUserId();
  }

  if (!userId) {
    return res.status(400).json({ success: false, error: 'Missing userId' });
  }

  const settings = await getOrCreateSettings(userId);
  if (!settings) {
    return res.status(404).json({ success: false, error: 'Settings not found' });
  }

  return res.status(200).json({ success: true, data: settings });
}

async function handlePost(req, res) {
  let userId = resolveUserId(req);
  if (!userId) {
    userId = await fallbackUserId();
  }

  if (!userId) {
    return res.status(400).json({ success: false, error: 'Missing userId' });
  }

  const settings = await getOrCreateSettings(userId);
  return res.status(200).json({ success: true, data: settings });
}

async function handlePatch(req, res) {
  const userId = resolveUserId(req) || (await fallbackUserId());
  if (!userId) {
    return res.status(400).json({ success: false, error: 'Missing userId' });
  }

  await getOrCreateSettings(userId);

  const updates = {
    public_phone: req.body?.publicPhone ?? req.body?.public_phone,
    service_radius_miles: req.body?.serviceRadiusMiles ?? req.body?.service_radius_miles,
    willing_to_travel: req.body?.willingToTravel ?? req.body?.willing_to_travel,
    travel_notes: req.body?.travelNotes ?? req.body?.travel_notes,
    search_radius_miles: req.body?.searchRadiusMiles ?? req.body?.search_radius_miles
  };

  const setFragments = [];
  const values = [];
  let index = 1;

  if (updates.public_phone !== undefined) {
    setFragments.push(`public_phone = $${index}`);
    values.push(updates.public_phone ? String(updates.public_phone).trim() : null);
    index += 1;
  }

  if (updates.service_radius_miles !== undefined) {
    const radius = Number(updates.service_radius_miles);
    setFragments.push(`service_radius_miles = $${index}`);
    values.push(Number.isFinite(radius) && radius > 0 ? Math.round(radius) : 25);
    index += 1;
  }

  if (updates.search_radius_miles !== undefined) {
    const radius = Number(updates.search_radius_miles);
    setFragments.push(`search_radius_miles = $${index}`);
    values.push(Number.isFinite(radius) && radius > 0 ? Math.round(radius) : 25);
    index += 1;
  }

  if (updates.willing_to_travel !== undefined) {
    const boolValue = parseBoolean(updates.willing_to_travel);
    setFragments.push(`willing_to_travel = $${index}`);
    values.push(Boolean(boolValue));
    index += 1;
  }

  if (updates.travel_notes !== undefined) {
    setFragments.push(`travel_notes = $${index}`);
    values.push(updates.travel_notes ? String(updates.travel_notes).trim() : null);
    index += 1;
  }

  if (!setFragments.length) {
    return res.status(400).json({ success: false, error: 'No updates provided' });
  }

  setFragments.push('updated_at = NOW()');

  const query = `
    UPDATE user_settings
    SET ${setFragments.join(', ')}
    WHERE user_id = $${index}
    RETURNING *;
  `;

  const [updated] = await sql.unsafe(query, [...values, userId]);
  return res.status(200).json({ success: true, data: updated });
}

export default async function handler(req, res) {
  try {
    await ensureBootstrap();

    if (req.method === 'GET') {
      return await handleGet(req, res);
    }

    if (req.method === 'POST') {
      return await handlePost(req, res);
    }

    if (req.method === 'PATCH') {
      // TODO: Lock settings updates to authenticated user once auth is wired in.
      return await handlePatch(req, res);
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('user-settings handler failed:', error);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Unable to process request' });
  }
}
