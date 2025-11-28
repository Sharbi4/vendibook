import { sql, bootstrapListingsTable } from '../../src/api/db.js';

/**
 * Nearby Listings Search API
 * GET /api/listings/nearby?lat=xxx&lng=xxx&radius=25
 * 
 * Uses Haversine formula for distance calculation
 * Returns listings within specified radius, sorted by distance
 */

// Earth's radius in miles
const EARTH_RADIUS_MILES = 3959;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await bootstrapListingsTable();
  } catch (error) {
    console.error('Failed to bootstrap listings:', error);
    return res.status(500).json({ success: false, error: 'Server initialization failed' });
  }

  try {
    const {
      lat,
      lng,
      latitude,
      longitude,
      radius = 25,
      listingType,
      listing_type,
      category,
      minPrice,
      maxPrice,
      verified,
      delivery,
      sort = 'distance',
      page = 1,
      limit = 20
    } = req.query;

    // Get coordinates
    const userLat = parseFloat(lat || latitude);
    const userLng = parseFloat(lng || longitude);

    if (!userLat || !userLng || isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({
        success: false,
        error: 'Valid latitude and longitude are required'
      });
    }

    const searchRadius = parseFloat(radius) || 25;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const type = listingType || listing_type;

    // Build the Haversine distance calculation in SQL
    // This calculates great-circle distance between two points
    const haversineFormula = sql`
      (${EARTH_RADIUS_MILES} * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(${userLat})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${userLng})) +
          sin(radians(${userLat})) * sin(radians(latitude))
        ))
      ))
    `;

    // Query listings with distance calculation
    const listings = await sql`
      SELECT 
        l.*,
        ${haversineFormula} as distance_miles
      FROM listings l
      WHERE 
        l.latitude IS NOT NULL 
        AND l.longitude IS NOT NULL
        AND ${haversineFormula} <= ${searchRadius}
        ${type ? sql`AND l.listing_type = ${type}` : sql``}
        ${category ? sql`AND l.category = ${category}` : sql``}
        ${minPrice ? sql`AND l.price >= ${parseFloat(minPrice)}` : sql``}
        ${maxPrice ? sql`AND l.price <= ${parseFloat(maxPrice)}` : sql``}
        ${verified === 'true' ? sql`AND l.is_verified = TRUE` : sql``}
        ${delivery === 'true' ? sql`AND l.delivery_available = TRUE` : sql``}
      ORDER BY 
        ${sort === 'price-low' ? sql`l.price ASC` :
          sort === 'price-high' ? sql`l.price DESC` :
          sort === 'newest' ? sql`l.created_at DESC` :
          sql`distance_miles ASC`}
      LIMIT ${parseInt(limit)} 
      OFFSET ${offset}
    `;

    // Get total count
    const [countResult] = await sql`
      SELECT COUNT(*)::int as total
      FROM listings l
      WHERE 
        l.latitude IS NOT NULL 
        AND l.longitude IS NOT NULL
        AND ${haversineFormula} <= ${searchRadius}
        ${type ? sql`AND l.listing_type = ${type}` : sql``}
        ${category ? sql`AND l.category = ${category}` : sql``}
        ${minPrice ? sql`AND l.price >= ${parseFloat(minPrice)}` : sql``}
        ${maxPrice ? sql`AND l.price <= ${parseFloat(maxPrice)}` : sql``}
        ${verified === 'true' ? sql`AND l.is_verified = TRUE` : sql``}
        ${delivery === 'true' ? sql`AND l.delivery_available = TRUE` : sql``}
    `;

    const total = countResult?.total || 0;

    return res.status(200).json({
      success: true,
      data: listings.map(formatListing),
      meta: {
        searchLocation: { latitude: userLat, longitude: userLng },
        searchRadius: searchRadius,
        unit: 'miles'
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Failed to search nearby listings:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to search listings'
    });
  }
}

function formatListing(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    city: row.display_city || row.city,
    state: row.display_state || row.state,
    price: parseFloat(row.price),
    listingType: row.listing_type,
    category: row.category,
    bookingMode: row.booking_mode,
    deliveryAvailable: row.delivery_available,
    isVerified: row.is_verified,
    serviceRadiusMiles: parseFloat(row.service_radius_miles) || null,
    distanceMiles: row.distance_miles ? Math.round(parseFloat(row.distance_miles) * 10) / 10 : null,
    coordinates: row.latitude && row.longitude ? {
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude)
    } : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Utility function to calculate distance between two points
 * Can be used client-side for filtering/sorting
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => deg * (Math.PI / 180);
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return EARTH_RADIUS_MILES * c;
}
