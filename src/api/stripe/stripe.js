import Stripe from 'stripe';
import dotenv from 'dotenv';

if (typeof process !== 'undefined' && !process.env.STRIPE_SECRET_KEY) {
  dotenv.config({ path: '.env.local' });
  if (!process.env.STRIPE_SECRET_KEY) {
    dotenv.config({ path: '.env' });
  }
}

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error('STRIPE_SECRET_KEY is not configured. Set it in your environment variables.');
}

export const stripe = new Stripe(secretKey, {
  apiVersion: '2023-10-16',
});

export function resolveAppOrigin(req) {
  if (req?.headers?.origin) {
    return req.headers.origin.replace(/\/$/, '');
  }

  const host = req?.headers?.host || process.env.APP_BASE_URL;
  if (!host) {
    return 'https://vendibook.com';
  }

  if (host.startsWith('http')) {
    return host.replace(/\/$/, '');
  }

  const protocol = req?.headers?.['x-forwarded-proto'] || 'https';
  return `${protocol}://${host}`.replace(/\/$/, '');
}
