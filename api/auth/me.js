/**
 * GET /api/auth/me - Get the current authenticated user
 * 
 * Headers required:
 * Authorization: Bearer <token>
 * 
 * Response: 200 OK
 * {
 *   user: { id, email, name, createdAt, role }
 * }
 * 
 * Response: 401 Unauthorized (if no valid token)
 */

const auth = require('../_auth');

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const user = auth.getCurrentUser(req);
  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Please log in.'
    });
  }
  
  return res.status(200).json({
    user: auth.getUserResponse(user)
  });
}
