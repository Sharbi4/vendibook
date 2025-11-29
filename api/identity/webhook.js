/**
 * POST /api/identity/webhook
 *
 * Stripe Identity webhook handler for verification session events
 *
 * Handles:
 * - identity.verification_session.verified
 * - identity.verification_session.requires_input
 * - identity.verification_session.canceled
 * - identity.verification_session.processing
 *
 * This endpoint should be configured in Stripe Dashboard:
 * https://dashboard.stripe.com/webhooks
 */

const Stripe = require('stripe');
const { Clerk } = require('@clerk/clerk-sdk-node');
const db = require('../_db');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia'
});

const clerk = process.env.CLERK_SECRET_KEY
  ? new Clerk({ secretKey: process.env.CLERK_SECRET_KEY })
  : null;

// Webhook signing secret from Stripe Dashboard
const webhookSecret = process.env.STRIPE_IDENTITY_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to read raw body
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get raw body for signature verification
    const rawBody = await getRawBody(req);
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      console.error('No Stripe signature found');
      return res.status(400).json({ error: 'No signature provided' });
    }

    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    console.log('Received Stripe Identity webhook event:', event.type);

    // Handle the event
    switch (event.type) {
      case 'identity.verification_session.verified': {
        const session = event.data.object;
        await handleVerified(session);
        break;
      }

      case 'identity.verification_session.requires_input': {
        const session = event.data.object;
        await handleRequiresInput(session);
        break;
      }

      case 'identity.verification_session.canceled': {
        const session = event.data.object;
        await handleCanceled(session);
        break;
      }

      case 'identity.verification_session.processing': {
        const session = event.data.object;
        await handleProcessing(session);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ error: 'Webhook handler failed', message: error.message });
  }
}

// Handle verified session
async function handleVerified(session) {
  console.log('Identity verification verified:', session.id);

  const userId = session.metadata?.userId;
  const clerkId = session.metadata?.clerkId;

  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // Update user in database
  const user = db.users.updateVerificationStatus(userId, 'verified', session.id);

  if (!user) {
    console.error('User not found:', userId);
    return;
  }

  console.log('User verification updated:', {
    userId: user.id,
    identityVerified: user.identityVerified,
    stripeVerifiedAt: user.stripeVerifiedAt
  });

  // Update Clerk metadata
  if (clerk && clerkId) {
    try {
      await clerk.users.updateUserMetadata(clerkId, {
        publicMetadata: {
          identityVerified: true,
          stripeVerificationStatus: 'verified',
          stripeVerifiedAt: user.stripeVerifiedAt
        }
      });
      console.log('Clerk metadata updated for user:', clerkId);
    } catch (error) {
      console.error('Failed to update Clerk metadata:', error);
    }
  }
}

// Handle requires_input (failed verification)
async function handleRequiresInput(session) {
  console.log('Identity verification requires input:', session.id);

  const userId = session.metadata?.userId;
  const clerkId = session.metadata?.clerkId;

  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // Update user status to failed
  const user = db.users.updateVerificationStatus(userId, 'requires_input', session.id);

  // Update Clerk metadata
  if (clerk && clerkId) {
    try {
      await clerk.users.updateUserMetadata(clerkId, {
        publicMetadata: {
          identityVerified: false,
          stripeVerificationStatus: 'requires_input'
        }
      });
    } catch (error) {
      console.error('Failed to update Clerk metadata:', error);
    }
  }

  console.log('User verification status updated to requires_input:', userId);
}

// Handle canceled session
async function handleCanceled(session) {
  console.log('Identity verification canceled:', session.id);

  const userId = session.metadata?.userId;
  const clerkId = session.metadata?.clerkId;

  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // Update user status to canceled
  const user = db.users.updateVerificationStatus(userId, 'canceled', session.id);

  // Update Clerk metadata
  if (clerk && clerkId) {
    try {
      await clerk.users.updateUserMetadata(clerkId, {
        publicMetadata: {
          identityVerified: false,
          stripeVerificationStatus: 'canceled'
        }
      });
    } catch (error) {
      console.error('Failed to update Clerk metadata:', error);
    }
  }

  console.log('User verification status updated to canceled:', userId);
}

// Handle processing state
async function handleProcessing(session) {
  console.log('Identity verification processing:', session.id);

  const userId = session.metadata?.userId;
  const clerkId = session.metadata?.clerkId;

  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // Update user status to processing
  const user = db.users.updateVerificationStatus(userId, 'processing', session.id);

  // Update Clerk metadata
  if (clerk && clerkId) {
    try {
      await clerk.users.updateUserMetadata(clerkId, {
        publicMetadata: {
          identityVerified: false,
          stripeVerificationStatus: 'processing'
        }
      });
    } catch (error) {
      console.error('Failed to update Clerk metadata:', error);
    }
  }

  console.log('User verification status updated to processing:', userId);
}
