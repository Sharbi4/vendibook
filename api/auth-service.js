/**
 * Production-Grade Authentication Module
 * 
 * Features:
 * - JWT tokens with expiration
 * - bcrypt password hashing
 * - Token refresh mechanism
 * - Secure token extraction
 * - Role-based access control
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
const BCRYPT_ROUNDS = 10;

// ============================================================================
// PASSWORD HASHING
// ============================================================================

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify password against hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password from database
 * @returns {Promise<boolean>} - True if password matches
 */
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// ============================================================================
// JWT TOKEN OPERATIONS
// ============================================================================

/**
 * Generate JWT token
 * @param {object} payload - Data to encode in token
 * @param {object} options - Token options
 * @returns {string} - JWT token
 */
function generateToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    ...options
  });
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object|null} - Decoded payload or null if invalid
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Create auth tokens (access + refresh)
 * @param {object} user - User object
 * @returns {object} - { accessToken, refreshToken }
 */
function createTokens(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = generateToken(payload, { expiresIn: '1h' });
  const refreshToken = generateToken(payload, { expiresIn: '30d' });

  return { accessToken, refreshToken };
}

// ============================================================================
// TOKEN EXTRACTION FROM REQUEST
// ============================================================================

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

  // Check query parameter (for WebSocket)
  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }

  // Check cookies
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').map(c => c.trim());
    const tokenCookie = cookies.find(c => c.startsWith('authToken='));
    if (tokenCookie) {
      token = tokenCookie.substring(10);
    }
  }

  return token;
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Get current authenticated user from request
 * @param {object} req - Node.js request object
 * @returns {Promise<object|null>} - User object or null
 */
async function getCurrentUser(req) {
  const token = extractToken(req);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  // Fetch fresh user data from database
  const user = await db.users.getById(payload.userId);
  return user || null;
}

/**
 * Require authentication middleware
 * @param {object} req - Node.js request object
 * @param {object} res - Node.js response object
 * @returns {Promise<object|null>} - User if authenticated, null if error sent
 */
async function requireAuth(req, res) {
  const user = await getCurrentUser(req);
  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Please log in.'
    });
  }
  return user;
}

/**
 * Require specific role
 * @param {string} requiredRole - Role to check (e.g., 'HOST', 'ADMIN')
 * @returns {function} - Middleware function
 */
function requireRole(requiredRole) {
  return async (req, res) => {
    const user = await requireAuth(req, res);
    if (!user) return null;

    if (user.role !== requiredRole) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This action requires ${requiredRole} role`
      });
    }

    return user;
  };
}

/**
 * Verify user owns resource
 * @param {object} req - Node.js request object
 * @param {object} res - Node.js response object
 * @param {string} resourceOwnerId - User ID of resource owner
 * @returns {Promise<object|null>} - User if authorized
 */
async function requireOwnership(req, res, resourceOwnerId) {
  const user = await requireAuth(req, res);
  if (!user) return null;

  if (user.id !== resourceOwnerId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have permission to access this resource'
    });
  }

  return user;
}

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

/**
 * Get safe user data (without sensitive fields)
 * @param {object} user - User from database
 * @returns {object} - Safe user data for frontend
 */
function getSafeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

/**
 * Send auth success response
 * @param {object} res - Response object
 * @param {object} user - User from database
 * @param {object} tokens - { accessToken, refreshToken }
 * @param {number} statusCode - HTTP status code (default 200)
 */
function sendAuthResponse(res, user, tokens, statusCode = 200) {
  // Set secure HTTP-only cookie for refresh token
  res.setHeader(
    'Set-Cookie',
    `refreshToken=${tokens.refreshToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}`
  );

  return res.status(statusCode).json({
    success: true,
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: getSafeUser(user)
  });
}

/**
 * Send error response
 * @param {object} res - Response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {object} details - Additional error details
 */
function sendErrorResponse(res, statusCode, message, details = {}) {
  return res.status(statusCode).json({
    error: true,
    message,
    ...details
  });
}

// ============================================================================
// TOKEN REFRESH
// ============================================================================

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {object|null} - New tokens or null if invalid
 */
async function refreshAccessToken(refreshToken) {
  const payload = verifyToken(refreshToken);
  if (!payload) return null;

  const user = await db.users.getById(payload.userId);
  if (!user) return null;

  return createTokens(user);
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, errors: string[] }
 */
function validatePassword(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain special character (!@#$%^&*)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Password operations
  hashPassword,
  verifyPassword,

  // Token operations
  generateToken,
  verifyToken,
  createTokens,
  refreshAccessToken,

  // Request handling
  extractToken,
  getCurrentUser,

  // Middleware
  requireAuth,
  requireRole,
  requireOwnership,

  // Response helpers
  getSafeUser,
  sendAuthResponse,
  sendErrorResponse,

  // Validation
  validatePassword,
  validateEmail
};
