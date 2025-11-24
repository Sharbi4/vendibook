<<<<<<< HEAD
import bcrypt from 'bcryptjs';
import { sql, bootstrapUsersTable } from '../../src/api/db.js';
import { createToken } from '../../src/api/auth/jwt.js';
import { sanitizeUser } from '../../src/api/auth/verificationService.js';
=======
/**
 * POST /api/auth/login - Authenticate and get session token
 * 
 * Request body:
 * {
 *   email: string (required)
 *   password: string (required)
 * }
 * 
 * Response: 200 OK
 * {
 *   token: string (auth token)
 *   user: { id, email, name, createdAt, role }
 * }
 */
>>>>>>> parent of aea4d91 (feat: implement authentication system)

const db = require('../_db');
const auth = require('../_auth');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { email, password } = req.body;
  
  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Missing required fields: email, password'
    });
  }
<<<<<<< HEAD
  return bootstrapPromise;
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
    const users = await sql`
      SELECT id, email, password_hash, first_name, last_name, phone, role,
             created_at, updated_at, is_verified, verification_sent_at, verified_at,
             stripe_connect_account_id, stripe_identity_verification_id,
             is_host_verified, host_verification_status, host_verification_updated_at
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

    const token = await createToken(user);
    return res.status(200).json({ success: true, data: { user: sanitizeUser(user), token } });
  } catch (error) {
    console.error('Failed to login:', error);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Unable to login' });
=======
  
  // Find user by email
  const user = db.users.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    });
  }
  
  // Verify password
  if (!auth.verifyPassword(password, user.password)) {
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    });
>>>>>>> parent of aea4d91 (feat: implement authentication system)
  }
  
  // Generate auth token
  const token = auth.generateToken();
  db.auth.storeToken(token, user.id);
  
  // Set auth token in response
  auth.setAuthToken(res, token);
  
  return res.status(200).json(
    auth.getAuthResponse(user, token)
  );
}
