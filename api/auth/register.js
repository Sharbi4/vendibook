/**
 * POST /api/auth/register - Register a new user
 */

const db = require('../../_db');
const { generateToken, hashPassword } = require('../../_auth');

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields: email, password, name' });
    }
    
    // Check if user already exists
    if (db.getUserByEmail(email)) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Create new user
    const userId = Date.now().toString();
    const hashedPassword = hashPassword(password);
    
    const user = {
      id: userId,
      email,
      password: hashedPassword,
      name,
      createdAt: new Date().toISOString()
    };
    
    db.addUser(user);
    
    // Generate token
    const token = generateToken();
    db.storeToken(token, userId);
    
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}
