/**
 * POST /api/auth/login - Authenticate a user
 */

const db = require('../../_db');
const { generateToken, hashPassword } = require('../../_auth');

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields: email, password' });
    }
    
    const user = db.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const hashedPassword = hashPassword(password);
    
    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = generateToken();
    db.storeToken(token, user.id);
    
    return res.status(200).json({
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
