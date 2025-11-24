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

import { sql, bootstrapUsersTable } from '../../src/api/db.js';
import {
  ensureListingsBootstrap,
  resolveHostColumnName,
  toPublicListing,
} from './shared.js';
import { requireClerkUserId } from '../_clerk.js';

const LISTING_TYPE_OPTIONS = new Set(['food_truck', 'food_trailer', 'ghost_kitchen', 'event_pro', 'lot']);
const BOOKING_MODE_OPTIONS = new Set(['daily', 'daily-with-time', 'hourly', 'package']);

export default async function handler(req, res) {
  try {
    await ensureListingsBootstrap();
  } catch (error) {
    console.error('Failed to initialize listings table:', error);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Failed to prepare listings table' });
  }

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

function sanitizeState(value) {
  return (value || '')
    .toString()
    .trim()
    .slice(0, 2)
    .toUpperCase();
}

function sanitizeCity(value) {
  return (value || '')
    .toString()
    .trim()
    .replace(/\s+/g, ' ');
}

function normalizeListingType(value) {
  const normalized = (value || '')
    .toString()
    .trim()
    .toLowerCase();
  return normalized || '';
}

function normalizeBookingMode(value) {
  const normalized = (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/_/g, '-');
  return normalized || 'daily-with-time';
}

async function handlePost(req, res) {
  const body = req.body || {};
  const validationErrors = {};

  const title = (body.title || '')
    .toString()
    .trim();
  if (title.length < 3) {
    validationErrors.title = 'Title must be at least 3 characters';
  }

  const listingType = normalizeListingType(body.listingType ?? body.listing_type);
  if (!listingType || !LISTING_TYPE_OPTIONS.has(listingType)) {
    validationErrors.listingType = 'Select a listing type';
  }

  const city = sanitizeCity(body.city);
  if (!city) {
    validationErrors.city = 'City is required';
  }

  const state = sanitizeState(body.state);
  if (state.length !== 2) {
    validationErrors.state = 'Enter a 2-letter state code';
  }

  const priceValue = Number(body.price);
  if (!Number.isFinite(priceValue) || priceValue <= 0) {
    validationErrors.price = 'Enter a valid price above zero';
  }

  const bookingMode = normalizeBookingMode(body.bookingMode ?? body.booking_mode ?? 'daily-with-time');
  if (!BOOKING_MODE_OPTIONS.has(bookingMode)) {
    validationErrors.bookingMode = 'Select a booking mode';
  }

  const rawServiceRadius = body.serviceRadiusMiles ?? body.service_radius_miles;
  const serviceRadiusMiles = rawServiceRadius === '' || rawServiceRadius == null ? 15 : Number(rawServiceRadius);
  if (!Number.isFinite(serviceRadiusMiles) || serviceRadiusMiles <= 0) {
    validationErrors.serviceRadiusMiles = 'Service radius must be greater than zero';
  }

  if (Object.keys(validationErrors).length) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validationErrors,
    });
  }

  try {
    const clerkId = requireClerkUserId(req);
    await bootstrapUsersTable();
    const [hostRecord] = await sql`
      SELECT id FROM users WHERE clerk_id = ${clerkId} LIMIT 1;
    `;

    if (!hostRecord?.id) {
      return res.status(403).json({
        success: false,
        error: 'Host profile not found',
        message: 'Complete your Vendibook host profile before creating listings.'
      });
    }

    const hostColumnName = await resolveHostColumnName();
    const columns = [
      'title',
      'description',
      'city',
      'state',
      'display_city',
      'display_state',
      'price',
      'listing_type',
      'booking_mode',
      'service_zone_type',
      'service_radius_miles',
      'display_zone_label'
    ];
    const values = [
      title,
      (body.description || '').toString().trim() || null,
      city,
      state,
      city,
      state,
      priceValue,
      listingType,
      bookingMode,
      'radius',
      serviceRadiusMiles,
      (body.serviceZoneLabel || body.service_zone_label || '').toString().trim() || null,
    ];

    if (hostColumnName) {
      columns.push(hostColumnName);
      values.push(hostRecord.id);
    }

    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    const insertedRows = await sql.unsafe(
      `INSERT INTO listings (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    const listingRow = insertedRows?.[0];
    if (!listingRow) {
      throw new Error('Failed to create listing');
    }

    const responseListing = toPublicListing(listingRow, hostColumnName);
    return res.status(201).json({ success: true, data: responseListing });
  } catch (error) {
    console.error('Failed to create listing:', error);
    const statusCode = error?.statusCode || error?.status || 500;
    return res.status(statusCode).json({
      success: false,
      error: statusCode === 401 ? 'Authentication required' : 'Failed to create listing',
      message: error.message || 'Unable to create listing',
    });
  }
}

async function handleGet(req, res) {
  try {
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

    let listings;
    let total = 0;

    if (filterConditions.length === 0) {
      listings = await sql`SELECT * FROM listings ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`;
      const countResult = await sql`SELECT COUNT(*)::int AS total FROM listings`;
      total = countResult[0]?.total ?? 0;
    } else {
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
