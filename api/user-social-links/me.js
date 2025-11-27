import { sql, bootstrapUserSocialLinksTable, bootstrapUsersTable } from '../../src/api/db.js';

let bootstrapPromise;

function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await bootstrapUsersTable();
      await bootstrapUserSocialLinksTable();
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

async function getOrCreateLinks(userId) {
  const [existing] = await sql`SELECT * FROM user_social_links WHERE user_id = ${userId} LIMIT 1`;
  if (existing) return existing;

  const [inserted] = await sql`
    INSERT INTO user_social_links (
      user_id
    ) VALUES (
      ${userId}
    )
    ON CONFLICT (user_id) DO NOTHING
    RETURNING *;
  `;

  if (inserted) return inserted;
  const [created] = await sql`SELECT * FROM user_social_links WHERE user_id = ${userId} LIMIT 1`;
  return created;
}

function sanitizeUrl(value) {
  if (!value) return null;
  try {
    const trimmed = String(value).trim();
    if (!trimmed) return null;
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  } catch (error) {
    return null;
  }
}

async function handleGet(req, res) {
  let userId = resolveUserId(req);
  if (!userId) {
    userId = await fallbackUserId();
  }

  if (!userId) {
    return res.status(400).json({ success: false, error: 'Missing userId' });
  }

  const links = await getOrCreateLinks(userId);
  if (!links) {
    return res.status(404).json({ success: false, error: 'Social links not found' });
  }

  return res.status(200).json({ success: true, data: links });
}

async function handlePost(req, res) {
  let userId = resolveUserId(req);
  if (!userId) {
    userId = await fallbackUserId();
  }

  if (!userId) {
    return res.status(400).json({ success: false, error: 'Missing userId' });
  }

  const links = await getOrCreateLinks(userId);
  return res.status(200).json({ success: true, data: links });
}

async function handlePatch(req, res) {
  const userId = resolveUserId(req) || (await fallbackUserId());
  if (!userId) {
    return res.status(400).json({ success: false, error: 'Missing userId' });
  }

  await getOrCreateLinks(userId);

  const updates = {
    instagram_url: req.body?.instagramUrl ?? req.body?.instagram_url,
    tiktok_url: req.body?.tiktokUrl ?? req.body?.tiktok_url,
    youtube_url: req.body?.youtubeUrl ?? req.body?.youtube_url,
    facebook_url: req.body?.facebookUrl ?? req.body?.facebook_url,
    website_url: req.body?.websiteUrl ?? req.body?.website_url
  };

  const setFragments = [];
  const values = [];
  let index = 1;

  for (const [column, rawValue] of Object.entries(updates)) {
    if (rawValue !== undefined) {
      setFragments.push(`${column} = $${index}`);
      values.push(sanitizeUrl(rawValue));
      index += 1;
    }
  }

  if (!setFragments.length) {
    return res.status(400).json({ success: false, error: 'No updates provided' });
  }

  setFragments.push('updated_at = NOW()');

  const query = `
    UPDATE user_social_links
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
      // TODO: Restrict updates to authenticated user once auth exists.
      return await handlePatch(req, res);
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('user-social-links handler failed:', error);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Unable to process request' });
  }
}
