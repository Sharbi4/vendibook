import bcrypt from 'bcryptjs';
import { sql, bootstrapUsersTable, bootstrapUserSettingsTable } from '../../src/api/db.js';
import { createToken } from '../../src/api/auth/jwt.js';

let bootstrapPromise;

async function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await bootstrapUsersTable();
      await bootstrapUserSettingsTable();
    })().catch((error) => {
      bootstrapPromise = undefined;
      throw error;
    });
  }
  return bootstrapPromise;
}

function normalizeEmail(value) {
  return (value || '').trim().toLowerCase();
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await ensureBootstrap();
  } catch (error) {
    console.error('Failed to bootstrap auth tables:', error);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Unable to initialize auth' });
  }

  const { firstName, lastName, email, password, phone } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Validation error', message: 'Email and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, error: 'Validation error', message: 'Password must be at least 8 characters' });
  }

  const normalizedEmail = normalizeEmail(email);

  try {
    const existing = await sql`SELECT id FROM users WHERE email = ${normalizedEmail} LIMIT 1;`;
    if (existing.length) {
      return res.status(409).json({ success: false, error: 'Conflict', message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const insertedRows = await sql`
      INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
      VALUES (${normalizedEmail}, ${passwordHash}, ${firstName || null}, ${lastName || null}, ${phone || null}, 'renter')
      RETURNING id, email, first_name, last_name, phone, role, created_at, updated_at;
    `;

    const user = insertedRows[0];
    const token = await createToken(user);

    return res.status(201).json({ success: true, data: { user: sanitizeUser(user), token } });
  } catch (error) {
    console.error('Failed to register user:', error);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Unable to register user' });
  }
}
  // Generate auth token
  const token = auth.generateToken();
  db.auth.storeToken(token, userId);
  
  // Set auth token in response
  auth.setAuthToken(res, token);
  
  return res.status(201).json(
    auth.getAuthResponse(user, token)
  );
}
