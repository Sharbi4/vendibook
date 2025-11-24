import { sql, bootstrapListingsTable, bootstrapEventProPackagesTable } from '../../src/api/db.js';

let bootstrapPromise;

function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await bootstrapListingsTable();
      await bootstrapEventProPackagesTable();
    })().catch((error) => {
      bootstrapPromise = undefined;
      throw error;
    });
  }

  return bootstrapPromise;
}

export default async function handler(req, res) {
  try {
    await ensureBootstrap();
  } catch (error) {
    console.error('Failed to initialize event_pro_packages table:', error);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Failed to initialize Event Pro packages' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

async function handleGet(req, res) {
  const listingId = req.query.listingId || req.query.listing_id;

  if (!listingId) {
    return res.status(400).json({ success: false, error: 'listingId is required' });
  }

  try {
    const packages = await sql`
      SELECT
        id,
        listing_id,
        name,
        description,
        base_price,
        max_guests,
        included_items,
        duration_hours,
        is_active,
        sort_order,
        created_at,
        updated_at
      FROM event_pro_packages
      WHERE listing_id = ${listingId} AND is_active = TRUE
      ORDER BY sort_order ASC NULLS LAST, created_at DESC;
    `;

    return res.status(200).json({ success: true, data: packages });
  } catch (error) {
    console.error('Failed to fetch Event Pro packages:', error);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Unable to fetch Event Pro packages' });
  }
}

async function handlePost(req, res) {
  const body = req.body || {};
  const listingId = body.listingId || body.listing_id;
  const packageId = body.id || body.packageId || body.package_id;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description = normalizeOptionalText(body.description ?? body.details ?? null);
  const basePrice = parsePrice(body.basePrice ?? body.base_price);
  const maxGuests = parseOptionalInteger(body.maxGuests ?? body.max_guests);
  const includedItems = normalizeOptionalText(body.includedItems ?? body.included_items ?? null);
  const durationHours = parseOptionalNumber(body.durationHours ?? body.duration_hours);
  const isActive = body.isActive ?? body.is_active ?? true;
  const sortOrder = parseOptionalInteger(body.sortOrder ?? body.sort_order);

  if (!listingId) {
    return res.status(400).json({ success: false, error: 'listingId is required' });
  }

  if (!name) {
    return res.status(400).json({ success: false, error: 'name is required' });
  }

  if (basePrice === null) {
    return res.status(400).json({ success: false, error: 'basePrice must be a positive number' });
  }

  try {
    const listing = await sql`SELECT id FROM listings WHERE id = ${listingId} LIMIT 1;`;
    if (!listing.length) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    // TODO: Enforce host authentication/authorization before allowing package mutations.

    if (packageId) {
      const updated = await sql`
        UPDATE event_pro_packages
        SET
          name = ${name},
          description = ${description},
          base_price = ${basePrice},
          max_guests = ${maxGuests},
          included_items = ${includedItems},
          duration_hours = ${durationHours},
          is_active = ${isActive},
          sort_order = ${sortOrder},
          updated_at = NOW()
        WHERE id = ${packageId} AND listing_id = ${listingId}
        RETURNING *;
      `;

      if (!updated.length) {
        return res.status(404).json({ success: false, error: 'Package not found' });
      }

      return res.status(200).json({ success: true, data: updated[0] });
    }

    const inserted = await sql`
      INSERT INTO event_pro_packages (
        listing_id,
        name,
        description,
        base_price,
        max_guests,
        included_items,
        duration_hours,
        is_active,
        sort_order
      ) VALUES (
        ${listingId},
        ${name},
        ${description},
        ${basePrice},
        ${maxGuests},
        ${includedItems},
        ${durationHours},
        ${isActive},
        ${sortOrder}
      )
      RETURNING *;
    `;

    return res.status(201).json({ success: true, data: inserted[0] });
  } catch (error) {
    console.error('Failed to upsert Event Pro package:', error);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Unable to save Event Pro package' });
  }
}

function normalizeOptionalText(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
}

function parsePrice(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }
  return Math.round(numeric * 100) / 100;
}

function parseOptionalInteger(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numeric = Number(value);
  if (!Number.isInteger(numeric)) {
    return null;
  }
  return numeric;
}

function parseOptionalNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }
  return Math.round(numeric * 100) / 100;
}
