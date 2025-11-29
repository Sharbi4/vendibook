/**
 * POST /api/identity/create-session
 *
 * Create a Stripe Identity verification session for the authenticated user
 *
 * Headers required:
 * Authorization: Bearer <clerk-token>
 *
 * Response: 200 OK
 * {
 *   sessionId: string,
 *   url: string,
 *   status: string
 * }
 *
 * Response: 401 Unauthorized (if no valid token)
 * Response: 400 Bad Request (if user already verified)
 */

const Stripe = require('stripe');
const { Clerk } = require('@clerk/clerk-sdk-node');
const db = require('../_db');

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia'
});

// Initialize Clerk
const clerk = process.env.CLERK_SECRET_KEY
  ? new Clerk({ secretKey: process.env.CLERK_SECRET_KEY })
  : null;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get Clerk session token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Please log in.'
      });
    }

    const token = authHeader.substring(7);

    if (!clerk) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Clerk is not configured. Please set CLERK_SECRET_KEY.'
      });
    }

    // Verify Clerk session token
    let clerkUser;
    try {
      const sessionToken = await clerk.sessions.verifyToken(token);
      clerkUser = await clerk.users.getUser(sessionToken.sub);
    } catch (error) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token.'
      });
    }

    // Get or create user in our database
    let user = db.users.getUserByClerkId(clerkUser.id);

    if (!user) {
      // Create new user
      user = db.users.addUser({
        id: `user_${Date.now()}`,
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
        role: 'user'
      });
    }

    // Check if user is already verified
    if (user.identityVerified) {
      return res.status(400).json({
        error: 'Already verified',
        message: 'Your identity has already been verified.',
        user: {
          identityVerified: user.identityVerified,
          stripeVerificationStatus: user.stripeVerificationStatus,
          stripeVerifiedAt: user.stripeVerifiedAt
        }
      });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Stripe is not configured. Please set STRIPE_SECRET_KEY.'
      });
    }

    // Create Stripe Identity verification session
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: {
        userId: user.id,
        clerkId: clerkUser.id,
        email: user.email
      },
      return_url: `${process.env.VITE_APP_URL || 'http://localhost:5173'}/verify-success`,
    });

    // Update user with verification session ID and status
    db.users.updateVerificationStatus(user.id, 'pending', verificationSession.id);

    // Also update Clerk user metadata
    try {
      await clerk.users.updateUserMetadata(clerkUser.id, {
        publicMetadata: {
          stripeVerificationSessionId: verificationSession.id,
          stripeVerificationStatus: 'pending'
        }
      });
    } catch (error) {
      console.error('Failed to update Clerk metadata:', error);
      // Continue anyway - main data is in our DB
    }

    return res.status(200).json({
      sessionId: verificationSession.id,
      url: verificationSession.url,
      status: verificationSession.status,
      message: 'Verification session created successfully. Please complete verification at the provided URL.'
    });

  } catch (error) {
    console.error('Error creating verification session:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to create verification session.'
    });
  }
}
