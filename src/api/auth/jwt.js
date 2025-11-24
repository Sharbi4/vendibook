import jwt from 'jsonwebtoken';

const DEFAULT_EXPIRATION = '7d';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

export function createToken(user, options = {}) {
  if (!user || !user.id) {
    throw new Error('Cannot sign token without user id');
  }

  const payload = {
    user_id: user.id,
    email: user.email,
    role: user.role || 'renter',
  };

  const expiresIn = options.expiresIn || DEFAULT_EXPIRATION;
  return jwt.sign(payload, getSecret(), { expiresIn });
}

export function verifyToken(token) {
  if (!token) {
    throw new Error('Missing token');
  }
  return jwt.verify(token, getSecret());
}
