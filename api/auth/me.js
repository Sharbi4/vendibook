/**
 * GET /api/auth/me - Get the current authenticated user
 */

const { getCurrentUser } = require('../../_auth');

export default function handler(req, res) {
  if (req.method === 'GET') {
    const user = getCurrentUser(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    return res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name
    });
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}
