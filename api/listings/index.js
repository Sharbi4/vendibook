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

function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapListingsTable();
  }
  return bootstrapPromise;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await ensureBootstrap();

    const {
      page = '1',
      limit = '20',
      city,
      state,
      listing_type: listingType
    } = req.query;

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

    const dataParams = [...filterParams, pageSize, offset];
    const limitPlaceholder = `$${filterParams.length + 1}`;
    const offsetPlaceholder = `$${filterParams.length + 2}`;

    const listings = await sql.unsafe(
      `SELECT * FROM listings ${whereClause} ORDER BY created_at DESC LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
      dataParams
    );

    const [{ total }] = await sql.unsafe(
      `SELECT COUNT(*)::int AS total FROM listings ${whereClause}`,
      filterParams
    );

    return res.status(200).json({
      success: true,
      data: listings,
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
