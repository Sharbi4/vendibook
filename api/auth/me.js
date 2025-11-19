/**
 * GET /api/auth/me
 *
 * Get current authenticated user
 * Requires Authorization header with Bearer token
 */

const { getCurrentUser } = require('../_auth');

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = getCurrentUser(req);

    if (!user) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'Please log in to access this resource'
      });
    }

    return res.status(200).json({ user });

  } catch (error) {
    console.error('Error fetching current user:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch user information'
    });
  }
}
