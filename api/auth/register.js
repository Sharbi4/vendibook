<<<<<<< HEAD
import { createClerkClient } from '@clerk/backend';
import { sql, bootstrapUserSettingsTable } from '../../src/api/db.js';
import { requireClerkSecretKey } from '../../src/api/auth/getClerkSecrets.js';

let clerk;

function getClerkClient() {
  if (!clerk) {
    const secretKey = requireClerkSecretKey();
    clerk = createClerkClient({ secretKey });
  }
  return clerk;
}
=======
/**
 * POST /api/auth/register - Register a new user account
 * 
 * Request body:
 * {
 *   email: string (required, unique)
 *   password: string (required, min 6 chars)
 *   name: string (required)
 * }
 * 
 * Response: 201 Created
 * {
 *   token: string (auth token)
 *   user: { id, email, name, createdAt }
 * }
 */
>>>>>>> parent of aea4d91 (feat: implement authentication system)

const db = require('../_db');
const auth = require('../_auth');

<<<<<<< HEAD
async function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
=======
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { email, password, name } = req.body;
  
  // Validate required fields
  if (!email || !password || !name) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Missing required fields: email, password, name'
    });
  }
  
  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Password must be at least 6 characters'
    });
>>>>>>> parent of aea4d91 (feat: implement authentication system)
  }
  
  // Check if user already exists
  if (db.users.getUserByEmail(email)) {
    return res.status(409).json({
      error: 'User already exists',
      message: `An account with email ${email} already exists`
    });
  }
<<<<<<< HEAD

  const { firstName, lastName, email, password, phone } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Validation error', message: 'Email and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, error: 'Validation error', message: 'Password must be at least 8 characters' });
  }

  const normalizedEmail = normalizeEmail(email);

  try {
    const clerkClient = getClerkClient();
    // Create user in Clerk
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [normalizedEmail],
      password,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      phoneNumber: phone ? [phone] : undefined,
    });

    // Sync user to local database
    const insertedRows = await sql`
      INSERT INTO users (
        clerk_id, email, first_name, last_name, phone, role, is_verified
      )
      VALUES (
        ${clerkUser.id},
        ${normalizedEmail},
        ${firstName || null},
        ${lastName || null},
        ${phone || null},
        'renter',
        ${clerkUser.emailAddresses[0]?.verification?.status === 'verified'}
      )
      ON CONFLICT (clerk_id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        is_verified = EXCLUDED.is_verified,
        updated_at = NOW()
      RETURNING id, clerk_id, email, first_name, last_name, phone, role, created_at, updated_at, is_verified;
    `;

    const user = insertedRows[0];

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          clerk_id: user.clerk_id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          role: user.role,
          isVerified: user.is_verified,
        },
        clerkUserId: clerkUser.id,
      },
    });
  } catch (error) {
    console.error('Failed to register user:', error);

    if (error?.statusCode === 401 && error.message === 'Missing CLERK_SECRET_KEY') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'CLERK_SECRET_KEY is required to register users. Update your environment configuration.',
      });
    }
    
    // Handle Clerk-specific errors
    if (error.errors) {
      const clerkError = error.errors[0];
      if (clerkError?.code === 'form_identifier_exists') {
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: 'Email already registered',
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Unable to register user',
    });
  }
=======
  
  // Create new user
  const userId = Date.now().toString();
  const hashedPassword = auth.hashPassword(password);
  
  const user = {
    id: userId,
    email,
    password: hashedPassword,
    name,
    createdAt: new Date().toISOString(),
    role: 'user' // Can be 'user', 'host', 'admin'
  };
  
  db.users.addUser(user);
  
  // Generate auth token
  const token = auth.generateToken();
  db.auth.storeToken(token, userId);
  
  // Set auth token in response
  auth.setAuthToken(res, token);
  
  return res.status(201).json(
    auth.getAuthResponse(user, token)
  );
>>>>>>> parent of aea4d91 (feat: implement authentication system)
}
