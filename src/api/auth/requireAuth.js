import { verifyToken } from './jwt.js';
import { sql } from '../db.js';

const COOKIE_NAME = 'vendibook_token';

function extractToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (header && typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.substring('Bearer '.length).trim();
  }

  const cookieHeader = req.headers.cookie || '';
  const cookies = cookieHeader.split(';').map((entry) => entry.trim());
  const tokenCookie = cookies.find((entry) => entry.startsWith(`${COOKIE_NAME}=`));
  if (tokenCookie) {
    return tokenCookie.substring(COOKIE_NAME.length + 1);
  }
  return null;
}

export async function requireAuth(req, res) {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorized', message: 'Missing token' });
    return null;
  }

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
