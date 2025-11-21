import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

if (typeof process !== 'undefined' && !process.env.DATABASE_URL) {
  dotenv.config({ path: '.env' });
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not defined. Please configure it in Vercel and your local environment.');
}

export const sql = neon(connectionString);

let bootstrapPromise;

export function bootstrapListingsTable() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
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
      bootstrapPromise = undefined;
      console.error('Failed to bootstrap listings table:', error);
      throw error;
    });
  }

  return bootstrapPromise;
}
