import { verifyToken } from './jwt.js';
import { sql } from '../db.js';

export async function requireAuth(req, res) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized', message: 'Missing authorization header' });
    return null;
  }

  const token = authHeader.substring('Bearer '.length).trim();

  try {
    const payload = await verifyToken(token);
    if (!payload?.user_id) {
      throw new Error('Invalid token payload');
    }

    const result = await sql`
      SELECT id, email, first_name, last_name, phone, role,
             created_at, updated_at, is_verified, verification_sent_at, verified_at,
             stripe_connect_account_id, stripe_identity_verification_id,
             is_host_verified, host_verification_status, host_verification_updated_at
      FROM users
      WHERE id = ${payload.user_id}
      LIMIT 1;
    `;
    const user = result[0];

    if (!user) {
      res.status(401).json({ success: false, error: 'Unauthorized', message: 'User not found' });
      return null;
    }

    return { user, token, payload };
  } catch (error) {
    console.error('Failed to authorize request:', error);
    res.status(401).json({ success: false, error: 'Unauthorized', message: 'Invalid or expired token' });
    return null;
  }
}
