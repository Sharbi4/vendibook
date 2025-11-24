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

  return {
    ...rest,
    city: safeCity,
    state: safeState,
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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

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
