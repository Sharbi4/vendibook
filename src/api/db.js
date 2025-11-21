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
let userVerificationsBootstrapPromise;
let userSettingsBootstrapPromise;
let userSocialLinksBootstrapPromise;

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

export function bootstrapUserVerificationsTable() {
  if (!userVerificationsBootstrapPromise) {
    userVerificationsBootstrapPromise = (async () => {
      await bootstrapUsersTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS user_verifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          id_verified BOOLEAN DEFAULT FALSE,
          title_verified BOOLEAN DEFAULT FALSE,
          notary_verified BOOLEAN DEFAULT FALSE,
          insurance_verified BOOLEAN DEFAULT FALSE,
          kyc_status TEXT,
          verification_level TEXT,
          notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (user_id)
        );
      `;
    })().catch(error => {
      userVerificationsBootstrapPromise = undefined;
      console.error('Failed to bootstrap user_verifications table:', error);
      throw error;
    });
  }

  return userVerificationsBootstrapPromise;
}

export function bootstrapUserSettingsTable() {
  if (!userSettingsBootstrapPromise) {
    userSettingsBootstrapPromise = (async () => {
      await bootstrapUsersTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS user_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          notifications_enabled BOOLEAN DEFAULT TRUE,
          search_radius_miles INTEGER DEFAULT 25,
          onboarding_step TEXT,
          subscription_plan TEXT,
          subscription_status TEXT,
          subscription_start_date TIMESTAMPTZ,
          subscription_pause_date TIMESTAMPTZ,
          account_status TEXT DEFAULT 'active',
          support_contact_events INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (user_id)
        );
      `;
    })().catch(error => {
      userSettingsBootstrapPromise = undefined;
      console.error('Failed to bootstrap user_settings table:', error);
      throw error;
    });
  }

  return userSettingsBootstrapPromise;
}

export function bootstrapUserSocialLinksTable() {
  if (!userSocialLinksBootstrapPromise) {
    userSocialLinksBootstrapPromise = (async () => {
      await bootstrapUsersTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS user_social_links (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          instagram_url TEXT,
          tiktok_url TEXT,
          youtube_url TEXT,
          facebook_url TEXT,
          website_url TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (user_id)
        );
      `;
    })().catch(error => {
      userSocialLinksBootstrapPromise = undefined;
      console.error('Failed to bootstrap user_social_links table:', error);
      throw error;
    });
  }

  return userSocialLinksBootstrapPromise;
}
