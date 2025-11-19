/**
 * POST /api/auth/login
 *
 * Authenticate user and return token
 * Body: { email, password }
 */

const db = require('../_db');
const { comparePasswords } = require('../_auth');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = db.users.getByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check password
    // NOTE: In production, use bcrypt.compare()!
    if (!comparePasswords(password, user.password)) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Create session
    const token = db.sessions.create(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      token,
      user: userWithoutPassword,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to log in'
    });
  }
}
