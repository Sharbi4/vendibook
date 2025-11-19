/**
 * Authentication helpers for Vercel serverless functions
 * Provides simple token-based auth (prototype level, not production secure)
 */

const db = require('./_db');
const crypto = require('crypto');

/**
 * Generate a simple token (prototype - use proper JWT in production)
 */
function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Hash a password (prototype - use bcrypt or similar in production)
 */
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Get the current user from the request
 * Checks Authorization header "Bearer <token>" or "token" cookie
 */
function getCurrentUser(req) {
  let token = null;
  
  // Check Authorization header
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  
  // Check cookies (if Set-Cookie was used)
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').map(c => c.trim());
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    if (tokenCookie) {
      token = tokenCookie.substring(6);
    }
  }
  
  if (!token) {
    return null;
  }
  
  const userId = db.getUserIdFromToken(token);
  if (!userId) {
    return null;
  }
  
  return db.getUserById(userId);
}

/**
 * Middleware-style function to require authentication
 * Returns user if authenticated, sends 401 and returns null if not
 */
function requireAuth(req, res) {
  const user = getCurrentUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return user;
}

module.exports = {
  generateToken,
  hashPassword,
  getCurrentUser,
  requireAuth
};
