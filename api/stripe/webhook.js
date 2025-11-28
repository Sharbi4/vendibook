import Stripe from 'stripe';
import { sql, bootstrapBookingsTable } from '../../src/api/db.js';

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

/**
 * Create or update booking from Stripe checkout session
 */
async function handleCheckoutCompleted(session) {
  const metadata = session.metadata || {};
  const {
    listingId,
    bookingType,
    startDate,
    endDate,
    basePrice,
    deliveryFee,
    serviceFee,
    totalAmount,
    rentalDays,
    bookingMode,
    isPickup,
    deliveryAddress,
    hostUserId,
    upsellCount,
    upsellIds
  } = metadata;

  if (!listingId || !startDate) {
    console.warn('Checkout session missing required metadata:', session.id);
    return null;
  }

  try {
    await bootstrapBookingsTable();

    // Check if booking already exists for this session
    const [existingBooking] = await sql`
      SELECT id FROM bookings
      WHERE stripe_session_id = ${session.id}
      LIMIT 1;
    `;

    if (existingBooking) {
      console.log('Booking already exists for session:', session.id);
      // Update status to PAID
      await sql`
        UPDATE bookings
        SET status = 'PAID',
            stripe_payment_intent_id = ${session.payment_intent},
            paid_at = NOW(),
            updated_at = NOW()
        WHERE id = ${existingBooking.id};
      `;
      return existingBooking.id;
    }

    // Get customer info
    let customerEmail = session.customer_email;
    let customerId = session.customer;

    if (customerId && !customerEmail) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        customerEmail = customer.email;
      } catch (e) {
        console.warn('Could not retrieve customer:', e.message);
      }
    }

    // Find or create renter user by email
    let renterUserId = null;
    if (customerEmail) {
      const [user] = await sql`
        SELECT id FROM users
        WHERE email = ${customerEmail}
        LIMIT 1;
      `;
      renterUserId = user?.id || null;
    }

    // Create booking record
    const [booking] = await sql`
      INSERT INTO bookings (
        listing_id,
        renter_user_id,
        host_user_id,
        start_date,
        end_date,
        total_price,
        currency,
        status,
        booking_mode,
        rental_days,
        stripe_session_id,
        stripe_payment_intent_id,
        stripe_customer_id,
        delivery_fee,
        service_fee,
        is_pickup,
        delivery_address,
        notes,
        paid_at,
        created_at,
        updated_at
      ) VALUES (
        ${listingId},
        ${renterUserId},
        ${hostUserId || null},
        ${startDate},
        ${endDate || startDate},
        ${parseFloat(totalAmount) || session.amount_total / 100},
        'USD',
        'PAID',
        ${bookingMode || 'daily'},
        ${parseInt(rentalDays, 10) || 1},
        ${session.id},
        ${session.payment_intent},
        ${customerId},
        ${parseFloat(deliveryFee) || 0},
        ${parseFloat(serviceFee) || 0},
        ${isPickup === 'true'},
        ${deliveryAddress || null},
        ${upsellCount ? `Upsells: ${upsellCount} items (${upsellIds || 'none'})` : null},
        NOW(),
        NOW(),
        NOW()
      )
      RETURNING id;
    `;

    console.log('Created booking from checkout:', booking.id);
    return booking.id;
  } catch (error) {
    console.error('Failed to create booking from checkout:', error);
    throw error;
  }
}

/**
 * Update booking status when payment succeeds
 */
async function handlePaymentSucceeded(paymentIntent) {
  try {
    await bootstrapBookingsTable();

    // Find booking by payment intent
    const [booking] = await sql`
      SELECT id, status FROM bookings
      WHERE stripe_payment_intent_id = ${paymentIntent.id}
      LIMIT 1;
    `;

    if (!booking) {
      console.log('No booking found for payment intent:', paymentIntent.id);
      return null;
    }

    // Update to PAID if not already
    if (booking.status !== 'PAID' && booking.status !== 'COMPLETED') {
      await sql`
        UPDATE bookings
        SET status = 'PAID',
            paid_at = NOW(),
            updated_at = NOW()
        WHERE id = ${booking.id};
      `;
      console.log('Updated booking to PAID:', booking.id);
    }

    return booking.id;
  } catch (error) {
    console.error('Failed to update booking on payment success:', error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent) {
  try {
    await bootstrapBookingsTable();

    // Find booking by payment intent
    const [booking] = await sql`
      SELECT id FROM bookings
      WHERE stripe_payment_intent_id = ${paymentIntent.id}
      LIMIT 1;
    `;

    if (!booking) {
      console.log('No booking found for failed payment:', paymentIntent.id);
      return null;
    }

    // Update with failure info
    await sql`
      UPDATE bookings
      SET notes = COALESCE(notes, '') || E'\n\nPayment failed: ' || ${paymentIntent.last_payment_error?.message || 'Unknown error'},
          updated_at = NOW()
      WHERE id = ${booking.id};
    `;

    console.log('Recorded payment failure for booking:', booking.id);
    return booking.id;
  } catch (error) {
    console.error('Failed to handle payment failure:', error);
    throw error;
  }
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

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        
        // Only process if payment was successful
        if (session.payment_status === 'paid') {
          await handleCheckoutCompleted(session);
        } else {
          console.log('Checkout completed but not paid:', session.payment_status);
        }
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
        console.log('Async payment succeeded for checkout:', session.id);
        await handleCheckoutCompleted(session);
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object;
        console.warn('Async payment failed for checkout:', session.id);
        // Log failure but don't create booking
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const failedIntent = event.data.object;
        console.warn('PaymentIntent failed:', failedIntent.id);
        await handlePaymentFailed(failedIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        console.log('Charge refunded:', charge.id);
        // TODO: Update booking status to REFUNDED
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object;
        console.warn('Dispute created:', dispute.id);
        // TODO: Flag booking for review
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
