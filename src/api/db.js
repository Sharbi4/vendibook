import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables prioritizing .env.local, then fallback to .env
if (typeof process !== 'undefined' && !process.env.DATABASE_URL) {
  dotenv.config({ path: '.env.local' });
}
if (typeof process !== 'undefined' && !process.env.DATABASE_URL) {
  dotenv.config({ path: '.env' });
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not defined. Please configure it in Vercel and your local environment.');
}

export const sql = neon(connectionString);

let listingsBootstrapPromise;
let usersBootstrapPromise;

export function bootstrapListingsTable() {
  if (!listingsBootstrapPromise) {
    listingsBootstrapPromise = (async () => {
      // Ensure pgcrypto extension exists for gen_random_uuid()
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS listings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          city TEXT,
          state TEXT,
          price NUMERIC NOT NULL,
          listing_type TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
    })().catch(error => {
      listingsBootstrapPromise = undefined;
      console.error('Failed to bootstrap listings table:', error);
      throw error;
    });
  }

  return listingsBootstrapPromise;
}

export function bootstrapUsersTable() {
  if (!usersBootstrapPromise) {
    usersBootstrapPromise = (async () => {
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          clerk_id TEXT UNIQUE NOT NULL,
          email TEXT,
          first_name TEXT,
          last_name TEXT,
          display_name TEXT,
          business_name TEXT,
          phone TEXT,
          city TEXT,
          state TEXT,
          role TEXT NOT NULL DEFAULT 'renter',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
    })().catch(error => {
      usersBootstrapPromise = undefined;
      console.error('Failed to bootstrap users table:', error);
      throw error;
    });
  }

  return usersBootstrapPromise;
}
