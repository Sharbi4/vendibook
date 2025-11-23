import bcrypt from 'bcryptjs';
import { sql, bootstrapUsersTable } from '../../src/api/db.js';
import { createToken } from '../../src/api/auth/jwt.js';

let bootstrapPromise;

async function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapUsersTable().catch((error) => {
      bootstrapPromise = undefined;
      throw error;
    });
  }
  return bootstrapPromise;
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
}

function normalizeEmail(value) {
  return (value || '').trim().toLowerCase();
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
    const users = await sql`SELECT id, email, password_hash, first_name, last_name, phone, role, created_at, updated_at FROM users WHERE email = ${normalizedEmail} LIMIT 1;`;
    const user = users[0];

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials', message: 'Email or password is incorrect' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash || '');
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials', message: 'Email or password is incorrect' });
    }

    const token = await createToken(user);
    return res.status(200).json({ success: true, data: { user: sanitizeUser(user), token } });
  } catch (error) {
    console.error('Failed to login:', error);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Unable to login' });
  }
}
