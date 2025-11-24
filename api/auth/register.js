import { createClerkClient } from '@clerk/backend';
import { sql, bootstrapUserSettingsTable } from '../../src/api/db.js';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

let bootstrapPromise;

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
    // Create user in Clerk
    const clerkUser = await clerk.users.createUser({
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
}
