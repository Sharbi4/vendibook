const DEV_AUTH_BYPASS =
  process.env.VITE_DEV_AUTH_BYPASS === 'true' || process.env.VITE_DEV_AUTH_BYPASS === '1';

function readHeader(headers = {}, key) {
  if (!headers) return null;
  return (
    headers[key] ||
    headers[key?.toLowerCase?.()] ||
    headers[key?.toUpperCase?.()] ||
    null
  );
}

export function extractClerkUserId(req, { required = false } = {}) {
  if (DEV_AUTH_BYPASS) {
    return 'dev-bypass-clerk-id';
  }

  const headers = req?.headers || {};
  const fromHeader = readHeader(headers, 'x-clerk-id');
  const fromAuthHeader = (() => {
    const authHeader = readHeader(headers, 'authorization');
    if (!authHeader || typeof authHeader !== 'string') {
      return null;
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() === 'bearer' && token) {
      return token;
    }
    return null;
  })();

  const fromBody = req?.body?.clerkId || req?.body?.clerk_id || null;
  const fromQuery = req?.query?.clerkId || req?.query?.clerk_id || null;

  const resolved = fromHeader || fromBody || fromQuery || fromAuthHeader || null;

  if (resolved || !required) {
    return resolved;
  }

  const error = new Error('Authentication required');
  error.statusCode = 401;
  throw error;
}

export function requireClerkUserId(req) {
  return extractClerkUserId(req, { required: true });
}
