/**
 * POST /api/auth/register
 *
 * Register a new user
 * Body: { email, password, name }
 */

const db = require('../_db');
const { isValidEmail, isValidPassword } = require('../_auth');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email, password, and name are required'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid email format'
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = db.users.getByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Create user
    // NOTE: In production, hash the password with bcrypt!
    const newUser = db.users.create({
      email: email.toLowerCase(),
      password, // SECURITY: Should be hashed!
      name,
      role: 'host' // Default role
    });

    // Create session
    const token = db.sessions.create(newUser.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      token,
      user: userWithoutPassword,
      message: 'Registration successful'
    });

  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to register user'
    });
  }
}
