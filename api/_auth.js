/**
 * Authentication Helpers for Vendibook API
 *
 * IMPORTANT: This is a PROTOTYPE authentication system.
 * In production, replace with:
 * - Proper password hashing (bcrypt, argon2)
 * - Secure JWT tokens with expiration
 * - HTTPS-only secure cookies
 * - CSRF protection
 * - Rate limiting
 * - OAuth providers (Google, Facebook, etc.)
 */

const db = require('./_db');

/**
 * Extract token from request
 * Checks both Authorization header and cookies
 */
function getTokenFromRequest(req) {
  // Check Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie (for browser requests)
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
}

/**
 * Get current user from request
 * Returns user object or null if not authenticated
 */
function getCurrentUser(req) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return null;
  }

  const userId = db.sessions.getUserId(token);
  if (!userId) {
    return null;
  }

  const user = db.users.getById(userId);
  if (!user) {
    return null;
  }

  // Don't return password
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Require authentication middleware
 * Returns user if authenticated, otherwise sends 401 response
 */
function requireAuth(req, res) {
  const user = getCurrentUser(req);

  if (!user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
    return null;
  }

  return user;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength (basic)
 */
function isValidPassword(password) {
  return password && password.length >= 6;
}

/**
 * Compare passwords (plain text for prototype)
 * In production, use bcrypt.compare()
 */
function comparePasswords(plainPassword, storedPassword) {
  return plainPassword === storedPassword;
}

module.exports = {
  getTokenFromRequest,
  getCurrentUser,
  requireAuth,
  isValidEmail,
  isValidPassword,
  comparePasswords
};
