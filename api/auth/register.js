/**
 * POST /api/auth/register - Register a new user account
 * 
 * Request body:
 * {
 *   email: string (required, unique)
 *   password: string (required, min 6 chars)
 *   name: string (required)
 * }
 * 
 * Response: 201 Created
 * {
 *   token: string (auth token)
 *   user: { id, email, name, createdAt }
 * }
 */

const db = require('../_db');
const auth = require('../_auth');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { email, password, name } = req.body;
  
  // Validate required fields
  if (!email || !password || !name) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Missing required fields: email, password, name'
    });
  }
  
  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Password must be at least 6 characters'
    });
  }
  
  // Check if user already exists
  if (db.users.getUserByEmail(email)) {
    return res.status(409).json({
      error: 'User already exists',
      message: `An account with email ${email} already exists`
    });
  }
  
  // Create new user
  const userId = Date.now().toString();
  const hashedPassword = auth.hashPassword(password);
  
  const user = {
    id: userId,
    email,
    password: hashedPassword,
    name,
    createdAt: new Date().toISOString(),
    role: 'user' // Can be 'user', 'host', 'admin'
  };
  
  db.users.addUser(user);
  
  // Generate auth token
  const token = auth.generateToken();
  db.auth.storeToken(token, userId);
  
  // Set auth token in response
  auth.setAuthToken(res, token);
  
  return res.status(201).json(
    auth.getAuthResponse(user, token)
  );
}
