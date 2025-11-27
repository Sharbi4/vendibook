/**
 * GET /api/listings - Get all listings with filters
 * 
 * Query parameters:
 * - listingType: RENT | SALE | EVENT_PRO
 * - category: food-trucks, trailers, ghost-kitchens, etc.
 * - location: city or state name
 * - priceMin: minimum price
 * - priceMax: maximum price
 * - verifiedOnly: true to show only verified vendors
 * - deliveryOnly: true to show only delivery-available items
 * - search: text search in title and description
 * - limit: max number of results (default 50)
 * 
 * Response: 200 OK
 * {
 *   count: number
 *   listings: [...] (array of listing objects)
 * }
 */

import { sql, bootstrapListingsTable } from '../../src/api/db.js';

let bootstrapPromise;
let hostColumnPromise;

function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapListingsTable();
  }
  return bootstrapPromise;
}

async function resolveHostColumnName() {
  if (!hostColumnPromise) {
    hostColumnPromise = (async () => {
      const preferredColumns = ['host_id', 'host_user_id', 'owner_id', 'user_id'];
      const rows = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'listings';
      `;

      const column = preferredColumns.find((name) => rows.some((row) => row.column_name === name)) || null;
      return column;
    })().catch((error) => {
      hostColumnPromise = undefined;
      console.error('Failed to resolve host_id column for listings:', error);
      throw error;
    });
  }

  return hostColumnPromise;
}

function attachHostId(listing, hostColumnName) {
  if (!listing) {
    return listing;
  }

  const hostId =
    listing.host_id ??
    listing.hostId ??
    (hostColumnName ? listing[hostColumnName] : undefined) ??
    listing.host_user_id ??
    listing.owner_id ??
    listing.user_id ??
    listing.ownerId ??
    listing.userId ??
    null;

  return {
    ...listing,
    host_id: hostId ?? null,
  };
}

function toPublicListing(listing, hostColumnName) {
  const listingWithHost = attachHostId(listing, hostColumnName);
  if (!listingWithHost) {
    return listingWithHost;
  }

  const {
    full_street_address,
    postal_code,
    latitude,
    longitude,
    display_city,
    display_state,
    display_zone_label,
    service_zone_type,
    service_radius_miles,
    city,
    state,
    ...rest
  } = listingWithHost;

  const safeCity = display_city || city || null;
  const safeState = display_state || state || null;

  const normalizedLatitude =
    typeof latitude === 'number' ? latitude : latitude != null ? Number(latitude) : null;
  const normalizedLongitude =
    typeof longitude === 'number' ? longitude : longitude != null ? Number(longitude) : null;

  return {
    ...rest,
    city: safeCity,
    state: safeState,
    latitude: Number.isFinite(normalizedLatitude) ? normalizedLatitude : null,
    longitude: Number.isFinite(normalizedLongitude) ? normalizedLongitude : null,
    service_zone: {
      type: service_zone_type || 'radius',
      radius_miles:
        typeof service_radius_miles === 'number'
          ? service_radius_miles
          : service_radius_miles != null
            ? Number(service_radius_miles)
            : 15,
      label: display_zone_label || null,
    }
  };
}
function parseRequestBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      console.warn('Failed to parse request body as JSON:', error);
      return {};
    }
  }
  return req.body;
}

function normalizeListingType(value) {
  const normalized = (value || '').toString().trim().toLowerCase();
  if (!normalized) return 'RENT';
  if (normalized.includes('event')) {
    return 'EVENT_PRO';
  }
  if (normalized.includes('sale')) {
    return 'SALE';
  }
  if (normalized.includes('rent')) {
    return 'RENT';
  }
  return normalized === 'event_pro' ? 'EVENT_PRO' : 'RENT';
}

async function handleGetListings(req, res) {
  try {
    await ensureBootstrap();
    const hostColumnName = await resolveHostColumnName();

    const {
      page = '1',
      limit = '20',
      city,
      state,
      listing_type: listingType,
      id
    } = req.query;

    if (id) {
      const listingRows = await sql`
        SELECT * FROM listings WHERE id = ${id} LIMIT 1
      `;
      const listing = Array.isArray(listingRows) && listingRows.length
        ? toPublicListing(listingRows[0], hostColumnName)
        : null;

      if (!listing) {
        return res.status(404).json({ success: false, error: 'Listing not found' });
      }

      // TODO: Expose secure detail endpoint post-booking to return full address + coordinates.
      return res.status(200).json({ success: true, data: listing });
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (pageNum - 1) * pageSize;

    const filterConditions = [];
    const filterParams = [];

    if (city) {
      filterConditions.push(`city = $${filterParams.length + 1}`);
      filterParams.push(city);
    }

    if (state) {
      filterConditions.push(`state = $${filterParams.length + 1}`);
      filterParams.push(state);
    }

    if (listingType) {
      filterConditions.push(`listing_type = $${filterParams.length + 1}`);
      filterParams.push(listingType);
    }

    const whereClause = filterConditions.length ? `WHERE ${filterConditions.join(' AND ')}` : '';

    // Use tagged template for safer queries
    let listings;
    let total = 0;

    if (filterConditions.length === 0) {
      // No filters - simple query
      listings = await sql`SELECT * FROM listings ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`;
      const countResult = await sql`SELECT COUNT(*)::int AS total FROM listings`;
      total = countResult[0]?.total ?? 0;
    } else {
      // With filters - use unsafe with proper array spreading
      const dataParams = [...filterParams, pageSize, offset];
      const limitPlaceholder = `$${filterParams.length + 1}`;
      const offsetPlaceholder = `$${filterParams.length + 2}`;

      listings = await sql.unsafe(
        `SELECT * FROM listings ${whereClause} ORDER BY created_at DESC LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
        dataParams
      );

      const countResult = await sql.unsafe(
        `SELECT COUNT(*)::int AS total FROM listings ${whereClause}`,
        filterParams
      );
      total = countResult[0]?.total ?? 0;
    }

    const normalizedListings = Array.isArray(listings)
      ? listings.map((row) => toPublicListing(row, hostColumnName))
      : [];

    return res.status(200).json({
      success: true,
      data: normalizedListings,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        pages: Math.max(Math.ceil(total / pageSize), 1)
      }
    });
  } catch (error) {
    console.error('Error handling listings request:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
}

async function handleCreateListing(req, res) {
  try {
    await ensureBootstrap();
    const hostColumnName = await resolveHostColumnName();
    const body = parseRequestBody(req);

    const title = (body.title || '').trim();
    const listingType = normalizeListingType(body.listing_type || body.listingType);
    const city = (body.city || '').trim();
    const state = (body.state || '').trim().toUpperCase();
    const description = (body.description || '').trim() || null;
    const price = Number(body.price);

    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    if (!city) {
      return res.status(400).json({ success: false, error: 'City is required' });
    }

    if (!state) {
      return res.status(400).json({ success: false, error: 'State is required' });
    }

    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ success: false, error: 'A valid numeric price is required' });
    }

    const bookingMode = (body.booking_mode || body.bookingMode || 'daily-with-time').trim();
    const defaultStartTime = body.default_start_time || body.defaultStartTime || null;
    const defaultEndTime = body.default_end_time || body.defaultEndTime || null;
    const displayCity = (body.display_city || city || '').trim() || null;
    const displayState = (body.display_state || state || '').trim() || null;
    const displayZoneLabel = (body.display_zone_label || body.service_zone_label || body.serviceZoneLabel || '').trim() || null;
    const serviceZoneType = (body.service_zone_type || body.serviceZoneType || 'radius').trim() || 'radius';
    const serviceRadiusValue = Number(body.service_radius_miles ?? body.serviceRadiusMiles ?? 15);
    const serviceRadiusMiles = Number.isFinite(serviceRadiusValue) && serviceRadiusValue > 0 ? serviceRadiusValue : 15;

    const [inserted] = await sql`
      INSERT INTO listings (
        title,
        description,
        city,
        state,
        price,
        listing_type,
        booking_mode,
        default_start_time,
        default_end_time,
        display_city,
        display_state,
        display_zone_label,
        service_zone_type,
        service_radius_miles
      ) VALUES (
        ${title},
        ${description},
        ${city},
        ${state},
        ${price},
        ${listingType},
        ${bookingMode},
        ${defaultStartTime},
        ${defaultEndTime},
        ${displayCity},
        ${displayState},
        ${displayZoneLabel},
        ${serviceZoneType},
        ${serviceRadiusMiles}
      )
      RETURNING *;
    `;

    const listing = toPublicListing(inserted, hostColumnName);
    return res.status(201).json({ success: true, data: listing });
  } catch (error) {
    console.error('Error creating listing:', error);
    return res.status(500).json({ success: false, error: 'Failed to create listing', message: error.message });
  }
}

async function handleUpdateListing(req, res) {
  try {
    await ensureBootstrap();
    const hostColumnName = await resolveHostColumnName();
    const body = parseRequestBody(req);
    const id = body.id || req.query.id;

    // TODO: Restrict updates to the authenticated host once auth is wired.

    if (!id) {
      return res.status(400).json({ success: false, error: 'Listing ID is required for updates' });
    }

    const updates = {};

    if (body.title !== undefined) {
      const title = (body.title || '').trim();
      if (!title) {
        return res.status(400).json({ success: false, error: 'Title cannot be empty' });
      }
      updates.title = title;
    }

    if (body.description !== undefined) {
      updates.description = (body.description || '').trim();
    }

    if (body.city !== undefined) {
      const city = (body.city || '').trim();
      if (!city) {
        return res.status(400).json({ success: false, error: 'City cannot be empty' });
      }
      updates.city = city;
      updates.display_city = body.display_city !== undefined ? (body.display_city || '').trim() : city;
    }

    if (body.state !== undefined) {
      const state = (body.state || '').trim().toUpperCase();
      if (!state) {
        return res.status(400).json({ success: false, error: 'State cannot be empty' });
      }
      updates.state = state;
      updates.display_state = body.display_state !== undefined ? (body.display_state || '').trim().toUpperCase() : state;
    }

    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price <= 0) {
        return res.status(400).json({ success: false, error: 'Price must be a positive number' });
      }
      updates.price = price;
    }

    if (body.listing_type !== undefined || body.listingType !== undefined) {
      updates.listing_type = normalizeListingType(body.listing_type || body.listingType);
    }

    if (body.booking_mode !== undefined || body.bookingMode !== undefined) {
      updates.booking_mode = (body.booking_mode || body.bookingMode || '').trim() || null;
    }

    if (body.default_start_time !== undefined || body.defaultStartTime !== undefined) {
      updates.default_start_time = body.default_start_time || body.defaultStartTime || null;
    }

    if (body.default_end_time !== undefined || body.defaultEndTime !== undefined) {
      updates.default_end_time = body.default_end_time || body.defaultEndTime || null;
    }

    if (body.display_zone_label !== undefined || body.service_zone_label !== undefined || body.serviceZoneLabel !== undefined) {
      updates.display_zone_label = (body.display_zone_label || body.service_zone_label || body.serviceZoneLabel || '').trim() || null;
    }

    if (body.service_zone_type !== undefined || body.serviceZoneType !== undefined) {
      updates.service_zone_type = (body.service_zone_type || body.serviceZoneType || '').trim() || null;
    }

    if (body.service_radius_miles !== undefined || body.serviceRadiusMiles !== undefined) {
      const radius = Number(body.service_radius_miles ?? body.serviceRadiusMiles);
      if (!Number.isFinite(radius) || radius <= 0) {
        return res.status(400).json({ success: false, error: 'Service radius must be a positive number' });
      }
      updates.service_radius_miles = radius;
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ success: false, error: 'No valid fields were provided for update' });
    }

    const setFragments = [];
    const values = [];
    let index = 1;

    for (const [column, value] of Object.entries(updates)) {
      setFragments.push(`${column} = $${index}`);
      values.push(value);
      index += 1;
    }

    const updateQuery = `
      UPDATE listings
      SET ${setFragments.join(', ')}
      WHERE id = $${index}
      RETURNING *;
    `;

    const rows = await sql.unsafe(updateQuery, [...values, id]);

    if (!rows || !rows.length) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    const listing = toPublicListing(rows[0], hostColumnName);
    return res.status(200).json({ success: true, data: listing });
  } catch (error) {
    console.error('Error updating listing:', error);
    return res.status(500).json({ success: false, error: 'Failed to update listing', message: error.message });
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGetListings(req, res);
  }

  if (req.method === 'POST') {
    return handleCreateListing(req, res);
  }

  if (req.method === 'PATCH') {
    return handleUpdateListing(req, res);
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
