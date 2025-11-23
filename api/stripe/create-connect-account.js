import { requireAuth } from '../../src/api/auth/requireAuth.js';
import { sql } from '../../src/api/db.js';
import { stripe } from '../../src/api/stripe/stripe.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const context = await requireAuth(req, res);
  if (!context) return;

  if (!context.user?.is_verified) {
    return res.status(403).json({ success: false, error: 'forbidden', message: 'Email verification required before onboarding.' });
  }

  try {
    const [dbUser] = await sql`
      SELECT id, email, stripe_connect_account_id
      FROM users
      WHERE id = ${context.user.id}
      LIMIT 1;
    `;

    if (!dbUser) {
      return res.status(404).json({ success: false, error: 'not_found', message: 'User not found' });
    }

    if (dbUser.stripe_connect_account_id) {
      return res.status(200).json({ success: true, data: { accountId: dbUser.stripe_connect_account_id } });
    }

    const account = await stripe.accounts.create({
      type: 'express',
      email: dbUser.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await sql`
      UPDATE users
      SET stripe_connect_account_id = ${account.id},
          host_verification_status = COALESCE(host_verification_status, 'pending'),
          host_verification_updated_at = NOW()
      WHERE id = ${dbUser.id}
    `;

    return res.status(200).json({ success: true, data: { accountId: account.id } });
  } catch (error) {
    console.error('Failed to create Stripe Connect account:', error);
    return res.status(500).json({ success: false, error: 'server_error', message: 'Unable to create connect account' });
  }
}
