import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

/**
 * GET /api/stripe/session
 * 
 * Retrieve Stripe checkout session details for the success page.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe secret key not configured' });
  }

  const sessionId = req.query.session_id;

  if (!sessionId) {
    return res.status(400).json({ error: 'session_id is required' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer']
    });

    // Return sanitized session data
    return res.status(200).json({
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_email: session.customer_email || session.customer?.email,
      metadata: session.metadata,
      line_items: session.line_items?.data?.map(item => ({
        description: item.description,
        amount_total: item.amount_total,
        quantity: item.quantity
      })),
      created: session.created
    });
  } catch (error) {
    console.error('Failed to retrieve session:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    return res.status(500).json({ 
      error: 'Failed to retrieve session',
      message: error.message 
    });
  }
}
