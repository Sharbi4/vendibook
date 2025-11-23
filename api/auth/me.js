import { requireAuth } from '../../src/api/auth/requireAuth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const context = await requireAuth(req, res);
  if (!context) {
    return; // response already sent
  }

  return res.status(200).json({ success: true, data: { user: context.user } });
}
