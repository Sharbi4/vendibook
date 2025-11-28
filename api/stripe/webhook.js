import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

export const config = {
  api: {
    bodyParser: false
  }
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(err));
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Stripe environment variables missing' });
  }

  const signature = req.headers['stripe-signature'];
  if (!signature) {
    return res.status(400).json({ error: 'Missing Stripe signature header' });
  }

  let event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // TODO: Log Stripe events to Neon once the analytics sink is finalized.

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        // TODO: Write booking confirmations to Neon when payment data is finalized.
        // TODO: Attach Stripe customer IDs to users once identity mapping is available.
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        // TODO: Update booking/payment status in database.
        // TODO: Log successful payments to Neon analytics.
        break;
      }
      case 'payment_intent.payment_failed': {
        const failedIntent = event.data.object;
        console.warn('PaymentIntent failed:', failedIntent.id);
        // TODO: Log failures to Neon and notify booking owners of declined payments.
        break;
      }
      default:
        console.log(`Unhandled Stripe event type ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook handler error:', error);
    return res.status(500).json({ error: 'Webhook handler error', message: error.message });
  }
}
