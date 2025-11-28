import Stripe from 'stripe';

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
    customerEmail
  } = body;

  // TODO: validate listingId
  // TODO: add role-based validation once Clerk integration is finalized

  const normalizedPrice = Number(price);
  if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
    return res.status(400).json({ error: 'A valid numeric price is required' });
  }

  if (!bookingType) {
    return res.status(400).json({ error: 'bookingType is required' });
  }

  let activeCustomerId = customerId || null;

  try {
    if (!activeCustomerId && customerEmail) {
      const customer = await stripe.customers.create({ email: customerEmail });
      activeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      customer: activeCustomerId || undefined,
      metadata: {
        listingId: listingId || '',
        bookingType,
        startDate: startDate || '',
        endDate: endDate || '',
        ...metadata
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: metadata?.description || `Vendibook ${bookingType}`
            },
            unit_amount: Math.round(normalizedPrice * 100)
          },
          quantity: 1
        }
      ]
    });

    return res.status(200).json({
      url: session.url,
      sessionId: session.id
    });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
}
