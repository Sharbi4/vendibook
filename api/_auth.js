/**
 * Authentication helpers for Vercel serverless functions
 * Provides simple token-based auth (prototype level, not production secure)
 * 
 * IMPORTANT: For production, implement proper security:
 * - Use proper JWT with signed tokens
 * - Use bcrypt for password hashing
 * - Implement refresh token rotation
 * - Add rate limiting on auth endpoints
 * - Use HTTPS only
 */

const db = require('./_db');
const crypto = require('crypto');

/**
 * Generate a simple token (prototype - use proper JWT in production)
 * @returns {string} - Random hex token
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a password (prototype - use bcrypt or argon2 in production)
 * @param {string} password - Plain text password
 * @returns {string} - SHA-256 hash
 */
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Verify a password against its hash
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Hash to check against
 * @returns {boolean} - True if password matches hash
 */
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

/**
 * Extract token from request (Authorization header or cookie)
 * @param {object} req - Node.js request object
 * @returns {string|null} - Token if found, null otherwise
 */
function extractToken(req) {
  let token = null;
  
  // Check Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  
  // Check for token query parameter (fallback for WebSocket/WebRTC scenarios)
  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }
  
  // Check cookies (if Set-Cookie was used)
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').map(c => c.trim());
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    if (tokenCookie) {
      token = tokenCookie.substring(6);
    }
  }
  
  return token;
}

/**
 * Get the current authenticated user from request
 * @param {object} req - Node.js request object
 * @returns {object|null} - User object if authenticated, null otherwise
 */
function getCurrentUser(req) {
  const token = extractToken(req);
  if (!token) return null;
  
  const userId = db.auth.getUserIdFromToken(token);
  if (!userId) return null;
  
  return db.users.getUserById(userId);
}

/**
 * Middleware-style function to require authentication
 * Returns user if authenticated, sends 401 response if not
 * @param {object} req - Node.js request object
 * @param {object} res - Node.js response object
 * @returns {object|null} - User object if authenticated, null if not (with 401 sent)
 */
function requireAuth(req, res) {
  const user = getCurrentUser(req);
  if (!user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Please log in.'
    });
    return null;
  }
  return user;
}

/**
 * Middleware-style function to verify user ownership
 * Checks that the authenticated user matches the specified user ID
 * @param {object} req - Node.js request object
 * @param {object} res - Node.js response object
 * @param {string} userId - User ID to check against
 * @returns {object|null} - User object if authorized, null if not (with 403 sent)
 */
function requireOwnership(req, res, userId) {
  const user = requireAuth(req, res);
  if (!user) return null;
  
  if (user.id !== userId) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have permission to access this resource.'
    });
    return null;
  }
  
  return user;
}

/**
 * Set authentication token in response headers and cookies
 * @param {object} res - Node.js response object
 * @param {string} token - Token to set
 */
function setAuthToken(res, token) {
  // Set as HTTP-only cookie (more secure)
  res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`);
  
  // Also return in response body for frontend to store in localStorage if needed
  return { token };
}

/**
 * Clear authentication token from response
 * @param {object} res - Node.js response object
 */
function clearAuthToken(res) {
  res.setHeader('Set-Cookie', 'token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
}

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

/**
 * Send authenticated user data (without sensitive fields)
 * @param {object} user - User object from database
 * @returns {object} - Safe user data for frontend
 */
function getUserResponse(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * Send login/register success response
 * @param {object} user - User object from database
 * @param {string} token - Auth token
 * @returns {object} - Response data with user and token
 */
function getAuthResponse(user, token) {
  return {
    token,
    user: getUserResponse(user)
  };
}

module.exports = {
  generateToken,
  hashPassword,
  verifyPassword,
  extractToken,
  getCurrentUser,
  requireAuth,
  requireOwnership,
  setAuthToken,
  clearAuthToken,
  getUserResponse,
  getAuthResponse
};