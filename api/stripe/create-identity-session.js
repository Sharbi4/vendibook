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
    return res.status(403).json({ success: false, error: 'forbidden', message: 'Email verification required before host onboarding.' });
  }

  try {
    const [dbUser] = await sql`
      SELECT id, email, stripe_connect_account_id, stripe_identity_verification_id
      FROM users
      WHERE id = ${context.user.id}
      LIMIT 1;
    `;

    if (!dbUser?.stripe_connect_account_id) {
      return res.status(400).json({ success: false, error: 'missing_account', message: 'Create a Stripe Connect account first.' });
    }

    const session = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: {
        userId: dbUser.id,
        email: dbUser.email || undefined,
      },
    });

    await sql`
      UPDATE users
      SET stripe_identity_verification_id = ${session.id},
          host_verification_status = 'processing',
          host_verification_updated_at = NOW()
      WHERE id = ${dbUser.id}
    `;

    return res.status(200).json({ success: true, data: { sessionId: session.id, url: session.url } });
  } catch (error) {
    console.error('Failed to create Stripe identity session:', error);
    return res.status(500).json({ success: false, error: 'server_error', message: 'Unable to start identity verification' });
  }
}
