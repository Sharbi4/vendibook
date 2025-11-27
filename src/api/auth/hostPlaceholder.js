const PLACEHOLDER_HOST_ID = '00000000-0000-0000-0000-000000000123';

/**
 * Resolve the current host for demo/testing contexts.
 * Tries to read a host identifier from query params, headers, or body,
 * and falls back to a deterministic placeholder so we can hydrate dashboard data without auth.
 * TODO: Replace with real authenticated host resolution once auth is wired.
 */
export function getCurrentHostId(req) {
  if (!req) {
    return PLACEHOLDER_HOST_ID;
  }

  const headerId =
    req.headers?.['x-host-id'] ||
    req.headers?.['x-hostid'] ||
    req.headers?.['host-id'] ||
    req.headers?.['hostid'] ||
    null;

  const queryId =
    req.query?.hostId ||
    req.query?.host_id ||
    null;

  const bodyId =
    req.body?.hostId ||
    req.body?.host_id ||
    null;

  return headerId || queryId || bodyId || PLACEHOLDER_HOST_ID;
}

export { PLACEHOLDER_HOST_ID };
