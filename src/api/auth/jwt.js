import { SignJWT, jwtVerify } from 'jose';

const DEFAULT_EXPIRATION = '7d';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return new TextEncoder().encode(secret);
}

export async function createToken(user, options = {}) {
  if (!user || !user.id) {
    throw new Error('Cannot sign token without user id');
  }

  const payload = {
    user_id: user.id,
    email: user.email,
    role: user.role || 'renter'
  };

  const exp = options.expiresIn || DEFAULT_EXPIRATION;

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(getSecret());
}

export async function verifyToken(token) {
  if (!token) {
    throw new Error('Missing token');
  }

  const { payload } = await jwtVerify(token, getSecret(), {
    algorithms: ['HS256']
  });

  return payload;
}
