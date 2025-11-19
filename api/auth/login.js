/**
 * POST /api/auth/login - Authenticate and get session token
 * 
 * Request body:
 * {
 *   email: string (required)
 *   password: string (required)
 * }
 * 
 * Response: 200 OK
 * {
 *   token: string (auth token)
 *   user: { id, email, name, createdAt, role }
 * }
 */

const db = require('../_db');
const auth = require('../_auth');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { email, password } = req.body;
  
  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Missing required fields: email, password'
    });
  }
  
  // Find user by email
  const user = db.users.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    });
  }
  
  // Verify password
  if (!auth.verifyPassword(password, user.password)) {
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    });
  }
  
  // Generate auth token
  const token = auth.generateToken();
  db.auth.storeToken(token, user.id);
  
  // Set auth token in response
  auth.setAuthToken(res, token);
  
  return res.status(200).json(
    auth.getAuthResponse(user, token)
  );
}
