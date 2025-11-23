import { sql } from '../../src/api/db.js';
import {
  ensureVerificationInfrastructure,
  sendVerificationEmailForUser,
} from '../../src/api/auth/verificationService.js';

function normalizeEmail(value) {
  return (value || '').trim().toLowerCase();
}

function resolveOrigin(req) {
  if (req?.headers?.origin) return req.headers.origin;
  const proto = req?.headers?.['x-forwarded-proto'] || 'https';
  const host = req?.headers?.host || process.env.APP_BASE_URL;
  if (host?.startsWith('http')) return host;
  return host ? `${proto}://${host}` : 'https://vendibook.com';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const email = normalizeEmail(req.body?.email);
  if (!email) {
    return res.status(400).json({ success: false, error: 'Validation error', message: 'Email is required' });
  }

  try {
    await ensureVerificationInfrastructure();
  } catch (bootstrapError) {
    console.error('Failed to prepare verification tables:', bootstrapError);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Unable to send verification email' });
  }

  try {
    const users = await sql`
      SELECT id, email, first_name, last_name, display_name, business_name, is_verified
      FROM users
      WHERE email = ${email}
      LIMIT 1;
    `;

    const user = users[0];
    if (!user) {
      // Avoid account enumeration
      return res.status(200).json({ success: true, message: 'If the account exists, an email has been sent.' });
    }

    if (user.is_verified) {
      return res.status(400).json({ success: false, error: 'already_verified', message: 'Email already verified' });
    }

    await sendVerificationEmailForUser(user, resolveOrigin(req));
    return res.status(200).json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Unable to send verification email' });
  }
}
