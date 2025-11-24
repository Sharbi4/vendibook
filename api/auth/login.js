import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql, bootstrapUsersTable } from '../../src/api/db.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';
const COOKIE_NAME = 'vendibook_token';

function normalizeEmail(value) {
  return (value || '').trim().toLowerCase();
}

function createToken(user) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return jwt.sign({ user_id: user.id, email: user.email, role: user.role || 'renter' }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [`${COOKIE_NAME}=${token}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${7 * 24 * 60 * 60}`];
  if (isProd) {
    parts.push('Secure');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

async function ensureBootstrap() {
  await bootstrapUsersTable();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await ensureBootstrap();
  } catch (error) {
    console.error('Failed to bootstrap users table:', error);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Unable to initialize auth' });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Validation error', message: 'Email and password are required' });
  }

  const normalizedEmail = normalizeEmail(email);
  try {
    const users = await sql`
      SELECT id, email, password_hash, first_name, last_name, phone, role,
             created_at, updated_at
      FROM users
      WHERE email = ${normalizedEmail}
      LIMIT 1;
    `;
    const user = users[0];

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials', message: 'Email or password is incorrect' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash || '');
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials', message: 'Email or password is incorrect' });
    }

    const token = createToken(user);
    setAuthCookie(res, token);
    return res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error('Failed to login:', error);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Unable to login' });
  }
}
