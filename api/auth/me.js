import jwt from 'jsonwebtoken';
import { sql, bootstrapUsersTable } from '../../src/api/db.js';

const COOKIE_NAME = 'vendibook_token';
const JWT_SECRET = process.env.JWT_SECRET;

function readTokenFromRequest(req) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = cookieHeader.split(';').map((entry) => entry.trim());
  const tokenCookie = cookies.find((entry) => entry.startsWith(`${COOKIE_NAME}=`));
  if (tokenCookie) {
    return tokenCookie.substring(COOKIE_NAME.length + 1);
  }
  return null;
}

async function ensureBootstrap() {
  await bootstrapUsersTable();
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await ensureBootstrap();
  } catch (error) {
    console.error('Failed to bootstrap users table:', error);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Unable to initialize auth' });
  }

  const token = readTokenFromRequest(req);
  if (!token || !JWT_SECRET) {
    return res.status(401).json({ success: false, error: 'Unauthorized', message: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const result = await sql`
      SELECT id, email, first_name, last_name, phone, role, created_at, updated_at
      FROM users
      WHERE id = ${payload.user_id}
      LIMIT 1;
    `;
    const user = result[0];
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized', message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error('Failed to verify token:', error);
    return res.status(401).json({ success: false, error: 'Unauthorized', message: 'Invalid token' });
  }
}
