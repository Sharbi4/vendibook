import { stripe } from '../../src/api/stripe/stripe.js';
import { sql, bootstrapUserVerificationEventsTable } from '../../src/api/db.js';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function getUserIdByConnectAccount(accountId) {
  if (!accountId) return null;
  const rows = await sql`SELECT id FROM users WHERE stripe_connect_account_id = ${accountId} LIMIT 1;`;
  return rows[0]?.id || null;
}

async function getUserIdByVerificationSession(sessionId) {
  if (!sessionId) return null;
  const rows = await sql`SELECT id FROM users WHERE stripe_identity_verification_id = ${sessionId} LIMIT 1;`;
  return rows[0]?.id || null;
}

async function recordEvent(userId, eventType, payload) {
  if (!userId) return;
  await bootstrapUserVerificationEventsTable();
  await sql`
    INSERT INTO user_verification_events (user_id, event_type, event_payload)
    VALUES (${userId}, ${eventType}, ${JSON.stringify(payload)})
  `;
}

async function markUserStatus(userId, { status, isVerified, sessionId }) {
  if (!userId) return;
  const verifiedValue = typeof isVerified === 'boolean' ? isVerified : null;
  const statusValue = status || null;
  await sql`
    UPDATE users
    SET host_verification_status = COALESCE(${statusValue}, host_verification_status),
        is_host_verified = COALESCE(${verifiedValue}, is_host_verified),
        host_verification_updated_at = NOW(),
        stripe_identity_verification_id = COALESCE(stripe_identity_verification_id, ${sessionId || null})
    WHERE id = ${userId}
  `;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET env variable.');
    return res.status(500).json({ success: false, error: 'server_error' });
  }

  let event;
  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error);
    return res.status(400).json({ success: false, error: 'invalid_signature' });
  }

  try {
    switch (event.type) {
      case 'identity.verification_session.verified': {
        const session = event.data.object;
        const userId = session.metadata?.userId || await getUserIdByVerificationSession(session.id);
        if (userId) {
          await markUserStatus(userId, { status: 'verified', isVerified: true, sessionId: session.id });
          await recordEvent(userId, event.type, session);
        }
        break;
      }
      case 'identity.verification_session.requires_input': {
        const session = event.data.object;
        const userId = session.metadata?.userId || await getUserIdByVerificationSession(session.id);
        if (userId) {
          await markUserStatus(userId, { status: 'action_required', isVerified: false, sessionId: session.id });
          await recordEvent(userId, event.type, session);
        }
        break;
      }
      case 'account.updated': {
        const account = event.data.object;
        const userId = await getUserIdByConnectAccount(account.id);
        if (userId) {
          const requirements = account.requirements || {};
          const needsInput = Boolean(
            (requirements.currently_due && requirements.currently_due.length) ||
            (requirements.past_due && requirements.past_due.length) ||
            requirements.disabled_reason
          );

          if (needsInput) {
            await markUserStatus(userId, { status: 'action_required', isVerified: false });
          } else if (account.charges_enabled && account.payouts_enabled) {
            await markUserStatus(userId, { status: 'verified', isVerified: true });
          } else {
            await markUserStatus(userId, { status: 'processing' });
          }
          await recordEvent(userId, event.type, account);
        }
        break;
      }
      case 'account.application.authorized': {
        const application = event.data.object;
        const connectAccountId = event.account || application?.account || null;
        const userId = await getUserIdByConnectAccount(connectAccountId);
        if (userId) {
          await markUserStatus(userId, { status: 'processing' });
          await recordEvent(userId, event.type, application);
        }
        break;
      }
      case 'account.application.deauthorized': {
        const application = event.data.object;
        const connectAccountId = event.account || application?.account || null;
        const userId = await getUserIdByConnectAccount(connectAccountId);
        if (userId) {
          await markUserStatus(userId, { status: 'action_required', isVerified: false });
          await recordEvent(userId, event.type, application);
        }
        break;
      }
      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling Stripe webhook event:', error);
    return res.status(500).json({ success: false, error: 'server_error' });
  }
}
