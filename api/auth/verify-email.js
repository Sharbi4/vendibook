import {
  ensureVerificationInfrastructure,
  consumeVerificationToken,
  sanitizeUser,
} from '../../src/api/auth/verificationService.js';

function getToken(req) {
  return req.query?.token || req.query?.Token || req.query?.t || req.query?.TOKEN || null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const rawToken = getToken(req);
  if (!rawToken) {
    return res.status(400).json({ success: false, error: 'Validation error', message: 'Missing verification token' });
  }

  try {
    await ensureVerificationInfrastructure();
  } catch (bootstrapError) {
    console.error('Failed to prepare verification flow:', bootstrapError);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Unable to verify email right now' });
  }

  try {
    const result = await consumeVerificationToken(rawToken);
    if (!result.valid) {
      const message = result.reason === 'expired'
        ? 'This verification link has expired. Request a new email to continue.'
        : 'This verification link is invalid. Request a new email to continue.';
      return res.status(400).json({ success: false, error: result.reason || 'invalid', message });
    }

    return res.status(200).json({ success: true, message: 'Email verified', data: { user: sanitizeUser(result.user) } });
  } catch (error) {
    console.error('Failed to verify email:', error);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Unable to verify email right now' });
  }
}
