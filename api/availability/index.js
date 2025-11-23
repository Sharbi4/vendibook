import {
  ensureAvailabilityBootstrap,
  resolveDateRange,
  computeUnavailableDates,
  getListingRules,
  createAvailabilityBlock
} from '../../src/api/availability/shared.js';

export default async function handler(req, res) {
  try {
    await ensureAvailabilityBootstrap();
  } catch (error) {
    console.error('Failed to bootstrap availability subsystem', error);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Initialization failed' });
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
  try {
    const listingId = req.query.listingId || req.query.listing_id;
    if (!listingId) {
      return res.status(400).json({ success: false, error: 'INVALID_REQUEST', message: 'listingId is required' });
    }

    const { startDate, endDate } = resolveDateRange(req.query.startDate || req.query.start_date, req.query.endDate || req.query.end_date);

    const [rules, unavailableDates] = await Promise.all([
      getListingRules(listingId),
      computeUnavailableDates(listingId, startDate, endDate)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        unavailableDates,
        rules: {
          minDaysNotice: rules.minDaysNotice,
          maxFutureDays: rules.maxFutureDays,
          minRentalDays: rules.minRentalDays,
          maxRentalDays: rules.maxRentalDays,
          bookingMode: rules.bookingMode,
          defaultStartTime: rules.defaultStartTime,
          defaultEndTime: rules.defaultEndTime
        }
      }
    });
  } catch (error) {
    return handleAvailabilityError(res, error, 'Failed to fetch availability');
  }
}

async function handlePost(req, res) {
  try {
    const body = req.body || {};
    const listingId = body.listingId || body.listing_id;
    const reason = body.reason || null;
    const startDate = normalizeDate(body.startDate || body.start_date, 'startDate');
    const endDate = normalizeDate(body.endDate || body.end_date, 'endDate');

    if (!listingId) {
      return res.status(400).json({ success: false, error: 'INVALID_REQUEST', message: 'listingId is required' });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ success: false, error: 'INVALID_RANGE', message: 'startDate must be on or before endDate' });
    }

    // TODO: enforce host authentication/authorization once the host model is finalized
    const block = await createAvailabilityBlock({ listingId, startDate, endDate, reason });

    return res.status(201).json({ success: true, data: block });
  } catch (error) {
    return handleAvailabilityError(res, error, 'Failed to create availability block');
  }
}

function normalizeDate(value, label) {
  if (!value) {
    throw createInlineHttpError(400, `${label} is required`);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw createInlineHttpError(400, `Invalid ${label}`);
  }
  return parsed.toISOString().split('T')[0];
}

function handleAvailabilityError(res, error, fallbackMessage) {
  if (error?.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: fallbackMessage,
      message: error.message
    });
  }

  console.error(fallbackMessage, error);
  return res.status(500).json({ success: false, error: 'Server error', message: fallbackMessage });
}

function createInlineHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}
