/**
 * GET /api/identity/status
 *
 * Get the current user's identity verification status
 *
 * Headers required:
 * Authorization: Bearer <clerk-token>
 *
 * Response: 200 OK
 * {
 *   identityVerified: boolean,
 *   stripeVerificationStatus: string,
 *   stripeVerificationSessionID: string | null,
 *   stripeVerifiedAt: string | null
 * }
 */

const { Clerk } = require('@clerk/clerk-sdk-node');
const db = require('../_db');

const clerk = process.env.CLERK_SECRET_KEY
  ? new Clerk({ secretKey: process.env.CLERK_SECRET_KEY })
  : null;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
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
        message: 'Clerk is not configured.'
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

    // Get user from our database
    let user = db.users.getUserByClerkId(clerkUser.id);

    if (!user) {
      // Create new user with default verification status
      user = db.users.addUser({
        id: `user_${Date.now()}`,
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
        role: 'user'
      });
    }

    return res.status(200).json({
      identityVerified: user.identityVerified || false,
      stripeVerificationStatus: user.stripeVerificationStatus || 'none',
      stripeVerificationSessionID: user.stripeVerificationSessionID || null,
      stripeVerifiedAt: user.stripeVerifiedAt || null
    });

  } catch (error) {
    console.error('Error getting verification status:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to get verification status.'
    });
  }
}
