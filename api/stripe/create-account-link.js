import { requireAuth } from '../../src/api/auth/requireAuth.js';
import { sql } from '../../src/api/db.js';
import { stripe, resolveAppOrigin } from '../../src/api/stripe/stripe.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const context = await requireAuth(req, res);
  if (!context) return;

  if (!context.user?.is_verified) {
    return res.status(403).json({ success: false, error: 'forbidden', message: 'Email verification required before onboarding.' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}');
    } catch (parseError) {
      return res.status(400).json({ success: false, error: 'invalid_json', message: 'Unable to parse request body' });
    }
  }
  body = body || {};
  const requestedAccountId = body.connectAccountId;

  try {
    const [dbUser] = await sql`
      SELECT id, stripe_connect_account_id
      FROM users
      WHERE id = ${context.user.id}
      LIMIT 1;
    `;

    const connectAccountId = requestedAccountId || dbUser?.stripe_connect_account_id;

    if (!connectAccountId) {
      return res.status(400).json({ success: false, error: 'missing_account', message: 'Create a Stripe Connect account first.' });
    }

    const origin = resolveAppOrigin(req);

    const link = await stripe.accountLinks.create({
      account: connectAccountId,
      refresh_url: `${origin}/host/onboarding`,
      return_url: `${origin}/host/onboarding`,
      type: 'account_onboarding',
    });

    return res.status(200).json({ success: true, data: { url: link.url } });
  } catch (error) {
    console.error('Failed to create account link:', error);
    return res.status(500).json({ success: false, error: 'server_error', message: 'Unable to create Stripe onboarding link' });
  }
}
