import Stripe from 'stripe';
import { sql, bootstrapBookingsTable } from '../../src/api/db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch (error) {
      console.warn('createCheckout: failed to parse JSON body', error);
      return {};
    }
  }
  return body;
}

/**
 * Round to 2 decimal places for currency
 */
function roundCurrency(amount) {
  return Math.round(amount * 100) / 100;
}

/**
 * Build line items for Stripe checkout
 * Includes base rental, delivery fee, service fee, and upsells
 */
function buildLineItems(params) {
  const {
    listingTitle,
    basePrice,
    deliveryFee,
    serviceFee,
    upsells,
    rentalDays,
    bookingMode
  } = params;

  const lineItems = [];

  // Main rental item
  const rentalDescription = bookingMode === 'hourly' 
    ? `${listingTitle} - Hourly Rental`
    : `${listingTitle} - ${rentalDays} day${rentalDays !== 1 ? 's' : ''}`;

  lineItems.push({
    price_data: {
      currency: 'usd',
      product_data: {
        name: rentalDescription,
        description: 'Food truck / equipment rental'
      },
      unit_amount: Math.round(basePrice * 100)
    },
    quantity: 1
  });

  // Delivery fee (if applicable)
  if (deliveryFee > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Delivery Fee',
          description: 'Delivery to your location'
        },
        unit_amount: Math.round(deliveryFee * 100)
      },
      quantity: 1
    });
  }

  // Service fee (13% renter fee)
  if (serviceFee > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Service Fee',
          description: 'Vendibook service fee (13%)'
        },
        unit_amount: Math.round(serviceFee * 100)
      },
      quantity: 1
    });
  }

  // Upsells
  if (upsells && Array.isArray(upsells) && upsells.length > 0) {
    for (const upsell of upsells) {
      if (upsell.price > 0) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: upsell.name || 'Add-on',
              description: upsell.description || ''
            },
            unit_amount: Math.round(upsell.price * 100)
          },
          quantity: 1
        });
      }
    }
  }

  return lineItems;
}

/**
 * Validate listing exists and get details
 */
async function getListingDetails(listingId) {
  if (!listingId) return null;
  
  try {
    await bootstrapBookingsTable();
    const [listing] = await sql`
      SELECT id, title, price, host_user_id, city, state
      FROM listings
      WHERE id = ${listingId}
      LIMIT 1;
    `;
    return listing || null;
  } catch (error) {
    console.warn('Failed to fetch listing:', error.message);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe secret key not configured' });
  }

  const origin = req.headers.origin || process.env.APP_URL || 'http://localhost:3000';
  const body = parseBody(req.body);
  const {
    listingId,
    bookingType,
    price,
    startDate,
    endDate,
    metadata = {},
    customerId,
    customerEmail,
    // Enhanced booking data
    basePrice,
    deliveryFee,
    serviceFee,
    upsells,
    rentalDays,
    isPickup,
    deliveryAddress,
    bookingMode
  } = body;

  // Validate price
  const normalizedPrice = Number(price);
  if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
    return res.status(400).json({ error: 'A valid numeric price is required' });
  }

  if (!bookingType) {
    return res.status(400).json({ error: 'bookingType is required' });
  }

  // Validate listing exists
  const listing = await getListingDetails(listingId);
  const listingTitle = listing?.title || metadata?.listingTitle || 'Vendibook Rental';

  let activeCustomerId = customerId || null;

  try {
    // Create or find Stripe customer
    if (!activeCustomerId && customerEmail) {
      // Check if customer already exists
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1
      });
      
      if (existingCustomers.data.length > 0) {
        activeCustomerId = existingCustomers.data[0].id;
      } else {
        const customer = await stripe.customers.create({ email: customerEmail });
        activeCustomerId = customer.id;
      }
    }

    // Build comprehensive metadata for webhook processing
    const checkoutMetadata = {
      // Core booking data
      listingId: String(listingId || ''),
      bookingType: String(bookingType),
      startDate: String(startDate || ''),
      endDate: String(endDate || startDate || ''),
      
      // Pricing breakdown
      basePrice: String(roundCurrency(basePrice || normalizedPrice)),
      deliveryFee: String(roundCurrency(deliveryFee || 0)),
      serviceFee: String(roundCurrency(serviceFee || 0)),
      totalAmount: String(roundCurrency(normalizedPrice)),
      
      // Booking details
      rentalDays: String(rentalDays || 1),
      bookingMode: String(bookingMode || 'daily'),
      isPickup: String(isPickup === true || isPickup === 'true'),
      
      // Delivery address (truncated if too long for Stripe 500 char limit)
      deliveryAddress: String(deliveryAddress || '').slice(0, 200),
      
      // Upsell summary
      upsellCount: String(upsells?.length || 0),
      upsellIds: upsells?.map(u => u.id).join(',').slice(0, 200) || '',
      
      // Host info
      hostUserId: String(listing?.host_user_id || metadata?.hostUserId || ''),
      
      // Spread additional metadata (but keep under limits)
      ...Object.fromEntries(
        Object.entries(metadata).slice(0, 10).map(([k, v]) => [k, String(v).slice(0, 200)])
      )
    };

    // Build line items for detailed receipt
    const useDetailedLineItems = basePrice !== undefined && serviceFee !== undefined;
    
    let lineItems;
    if (useDetailedLineItems) {
      lineItems = buildLineItems({
        listingTitle,
        basePrice: basePrice || normalizedPrice,
        deliveryFee: deliveryFee || 0,
        serviceFee: serviceFee || 0,
        upsells: upsells || [],
        rentalDays: rentalDays || 1,
        bookingMode: bookingMode || 'daily'
      });
    } else {
      // Fallback to simple line item
      lineItems = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: metadata?.description || `${listingTitle} Rental`,
              description: `${rentalDays || 1} day rental with 13% service fee`
            },
            unit_amount: Math.round(normalizedPrice * 100)
          },
          quantity: 1
        }
      ];
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel?listing_id=${listingId || ''}`,
      customer: activeCustomerId || undefined,
      customer_email: !activeCustomerId ? customerEmail : undefined,
      metadata: checkoutMetadata,
      line_items: lineItems,
      // Enable billing address collection for delivery
      billing_address_collection: isPickup === false ? 'required' : 'auto',
      // Allow promo codes
      allow_promotion_codes: true,
      // Set expiration (30 min)
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      // Custom text
      custom_text: {
        submit: {
          message: 'Your card will be charged after the host approves your booking request.'
        }
      }
    });

    return res.status(200).json({
      url: session.url,
      sessionId: session.id,
      customerId: activeCustomerId,
      expiresAt: session.expires_at
    });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
}
