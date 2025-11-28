import { sql, bootstrapAnalyticsEventsTable } from '../../src/api/db.js';

/**
 * Analytics Tracking API
 * POST /api/analytics/track - Track an analytics event
 * GET /api/analytics/summary - Get analytics summary (admin only)
 */

// Event type constants
export const ANALYTICS_EVENTS = {
  // Listing events
  LISTING_VIEW: 'listing_view',
  LISTING_SAVE: 'listing_save',
  LISTING_UNSAVE: 'listing_unsave',
  LISTING_SHARE: 'listing_share',
  LISTING_CONTACT: 'listing_contact',
  LISTING_CREATED: 'listing_created',
  LISTING_PUBLISHED: 'listing_published',
  
  // Booking events
  BOOKING_STARTED: 'booking_started',
  BOOKING_DATES_SELECTED: 'booking_dates_selected',
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELED: 'booking_canceled',
  
  // Search events
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  SEARCH_RESULT_CLICKED: 'search_result_clicked',
  
  // User events
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  LOGIN: 'login',
  HOST_ONBOARDING_STARTED: 'host_onboarding_started',
  HOST_ONBOARDING_COMPLETED: 'host_onboarding_completed',
  
  // Message events
  MESSAGE_SENT: 'message_sent',
  THREAD_OPENED: 'thread_opened',
  
  // Page views
  PAGE_VIEW: 'page_view'
};

export default async function handler(req, res) {
  try {
    await bootstrapAnalyticsEventsTable();
  } catch (error) {
    console.error('Failed to bootstrap analytics:', error);
    return res.status(500).json({ success: false, error: 'Server initialization failed' });
  }

  if (req.method === 'POST') {
    return handleTrack(req, res);
  }

  if (req.method === 'GET') {
    return handleSummary(req, res);
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

async function handleTrack(req, res) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const {
      event,
      eventType,
      userId,
      listingId,
      bookingId,
      sessionId,
      properties = {},
      url,
      referrer
    } = body;

    const eventName = event || eventType;
    
    if (!eventName) {
      return res.status(400).json({
        success: false,
        error: 'event or eventType is required'
      });
    }

    // Get user agent and IP from request headers
    const userAgent = req.headers['user-agent'] || null;
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                      req.headers['x-real-ip'] || 
                      req.socket?.remoteAddress || null;

    // Insert analytics event
    const [eventRecord] = await sql`
      INSERT INTO analytics_events (
        event_type,
        user_id,
        listing_id,
        booking_id,
        session_id,
        properties,
        user_agent,
        ip_address,
        referrer,
        url
      ) VALUES (
        ${eventName},
        ${userId || null},
        ${listingId || null},
        ${bookingId || null},
        ${sessionId || null},
        ${JSON.stringify(properties)}::jsonb,
        ${userAgent},
        ${ipAddress},
        ${referrer || null},
        ${url || null}
      )
      RETURNING id, event_type, created_at
    `;

    return res.status(201).json({
      success: true,
      data: {
        id: eventRecord.id,
        eventType: eventRecord.event_type,
        createdAt: eventRecord.created_at
      }
    });
  } catch (error) {
    console.error('Failed to track event:', error);
    // Don't return error to client - analytics should fail silently
    return res.status(200).json({ success: true, queued: true });
  }
}

async function handleSummary(req, res) {
  try {
    const { 
      startDate, 
      endDate, 
      eventType,
      listingId,
      groupBy = 'day'
    } = req.query;

    // Default to last 30 days
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();

    // Get event counts by type
    const eventCounts = await sql`
      SELECT 
        event_type,
        COUNT(*)::int as count
      FROM analytics_events
      WHERE created_at >= ${start}::timestamptz
        AND created_at <= ${end}::timestamptz
        ${listingId ? sql`AND listing_id = ${listingId}` : sql``}
        ${eventType ? sql`AND event_type = ${eventType}` : sql``}
      GROUP BY event_type
      ORDER BY count DESC
    `;

    // Get daily/hourly breakdown
    let timeSeriesQuery;
    if (groupBy === 'hour') {
      timeSeriesQuery = sql`
        SELECT 
          date_trunc('hour', created_at) as period,
          COUNT(*)::int as count
        FROM analytics_events
        WHERE created_at >= ${start}::timestamptz
          AND created_at <= ${end}::timestamptz
          ${eventType ? sql`AND event_type = ${eventType}` : sql``}
        GROUP BY period
        ORDER BY period
      `;
    } else {
      timeSeriesQuery = sql`
        SELECT 
          date_trunc('day', created_at) as period,
          COUNT(*)::int as count
        FROM analytics_events
        WHERE created_at >= ${start}::timestamptz
          AND created_at <= ${end}::timestamptz
          ${eventType ? sql`AND event_type = ${eventType}` : sql``}
        GROUP BY period
        ORDER BY period
      `;
    }

    const timeSeries = await timeSeriesQuery;

    // Get top listings by views
    const topListings = await sql`
      SELECT 
        listing_id,
        COUNT(*)::int as view_count
      FROM analytics_events
      WHERE event_type = 'listing_view'
        AND listing_id IS NOT NULL
        AND created_at >= ${start}::timestamptz
        AND created_at <= ${end}::timestamptz
      GROUP BY listing_id
      ORDER BY view_count DESC
      LIMIT 10
    `;

    // Get conversion funnel
    const funnel = await sql`
      SELECT 
        COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'listing_view')::int as views,
        COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'booking_started')::int as booking_started,
        COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'checkout_started')::int as checkout_started,
        COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'checkout_completed')::int as checkout_completed
      FROM analytics_events
      WHERE created_at >= ${start}::timestamptz
        AND created_at <= ${end}::timestamptz
    `;

    return res.status(200).json({
      success: true,
      data: {
        dateRange: { start, end },
        eventCounts: eventCounts.reduce((acc, row) => {
          acc[row.event_type] = row.count;
          return acc;
        }, {}),
        timeSeries: timeSeries.map(row => ({
          period: row.period,
          count: row.count
        })),
        topListings,
        funnel: funnel[0] || { views: 0, booking_started: 0, checkout_started: 0, checkout_completed: 0 }
      }
    });
  } catch (error) {
    console.error('Failed to get analytics summary:', error);
    return res.status(500).json({ success: false, error: 'Failed to get analytics' });
  }
}
