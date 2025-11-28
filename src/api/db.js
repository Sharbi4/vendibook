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
let userPayoutAccountsBootstrapPromise;
let userMetricsBootstrapPromise;
let bookingsBootstrapPromise;
let availabilityBlocksBootstrapPromise;
let listingBookingRulesBootstrapPromise;
let messageThreadsBootstrapPromise;
let messagesBootstrapPromise;
let notificationsBootstrapPromise;
let eventProPackagesBootstrapPromise;
let saleTransactionsBootstrapPromise;
let saleUpsellsBootstrapPromise;
let listingDocumentsBootstrapPromise;
let listingSpecificationsBootstrapPromise;
let listingAvailabilityBootstrapPromise;
let listingPricingBootstrapPromise;
let listingLocationBootstrapPromise;
let listingMediaBootstrapPromise;
let listingComplianceBootstrapPromise;
let listingAttributesBootstrapPromise;
let userListingsBootstrapPromise;

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

      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS booking_mode TEXT NOT NULL DEFAULT 'daily-with-time';
      `;

      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS default_start_time TIME NULL;
      `;

      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS default_end_time TIME NULL;
      `;

      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS full_street_address TEXT NULL;
      `;

      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS postal_code TEXT NULL;
      `;

      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS latitude NUMERIC NULL;
      `;

      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS longitude NUMERIC NULL;
      `;

      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS display_city TEXT NULL;
      `;

      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS display_state TEXT NULL;
      `;

      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS display_zone_label TEXT NULL;
      `;

      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS service_zone_type TEXT NOT NULL DEFAULT 'radius';
      `;

      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS service_radius_miles NUMERIC NOT NULL DEFAULT 15;
      `;

      // ========== SALE LISTING SPECIFIC COLUMNS ==========
      
      // Vehicle/Equipment details
      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS year INTEGER NULL;
      `;
      
      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS make TEXT NULL;
      `;
      
      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS model TEXT NULL;
      `;
      
      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS vin_number TEXT NULL;
      `;
      
      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS mileage INTEGER NULL;
      `;
      
      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS hours INTEGER NULL;
      `;
      
      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS equipment_list TEXT NULL;
      `;
      
      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS dimensions TEXT NULL;
      `;
      
      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS item_condition TEXT NULL;
      `;
      
      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS condition_notes TEXT NULL;
      `;
      
      // Sale status and verification
      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS sale_status TEXT DEFAULT 'Published';
      `;
      
      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS title_verified BOOLEAN DEFAULT FALSE;
      `;
      
      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS inspection_available BOOLEAN DEFAULT FALSE;
      `;
      
      // Delivery/shipping options for sales
      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS delivery_available BOOLEAN DEFAULT FALSE;
      `;
      
      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS shipping_available BOOLEAN DEFAULT FALSE;
      `;
      
      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS shipping_notes TEXT NULL;
      `;
      
      // Owner/Host reference
      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS owner_user_id UUID NULL;
      `;
      
      // Video link
      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS video_url TEXT NULL;
      `;
      
      // Sale category (food_truck, food_trailer, vendor_cart, other_mobile_equipment)
      await sql`
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS sale_category TEXT NULL;
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

      await sql`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS tagline TEXT;
      `;

      await sql`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS bio TEXT;
      `;

      await sql`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS service_area_description TEXT;
      `;

      await sql`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS cuisines TEXT;
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

      await sql`
        ALTER TABLE user_settings
        ADD COLUMN IF NOT EXISTS public_phone TEXT;
      `;

      await sql`
        ALTER TABLE user_settings
        ADD COLUMN IF NOT EXISTS service_radius_miles INTEGER DEFAULT 25;
      `;

      await sql`
        ALTER TABLE user_settings
        ADD COLUMN IF NOT EXISTS willing_to_travel BOOLEAN DEFAULT FALSE;
      `;

      await sql`
        ALTER TABLE user_settings
        ADD COLUMN IF NOT EXISTS travel_notes TEXT;
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

export function bootstrapUserPayoutAccountsTable() {
  if (!userPayoutAccountsBootstrapPromise) {
    userPayoutAccountsBootstrapPromise = (async () => {
      await bootstrapUsersTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS user_payout_accounts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          stripe_connect_id TEXT,
          stripe_customer_id TEXT,
          plaid_account_id TEXT,
          plaid_status TEXT,
          payout_enabled BOOLEAN DEFAULT FALSE,
          last_payout_date TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (user_id)
        );
      `;
    })().catch(error => {
      userPayoutAccountsBootstrapPromise = undefined;
      console.error('Failed to bootstrap user_payout_accounts table:', error);
      throw error;
    });
  }

  return userPayoutAccountsBootstrapPromise;
}

export function bootstrapUserMetricsTable() {
  if (!userMetricsBootstrapPromise) {
    userMetricsBootstrapPromise = (async () => {
      await bootstrapUsersTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS user_metrics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          rating_average NUMERIC DEFAULT 0,
          rating_count INTEGER DEFAULT 0,
          reviews_written INTEGER DEFAULT 0,
          reviews_received INTEGER DEFAULT 0,
          followers INTEGER DEFAULT 0,
          following INTEGER DEFAULT 0,
          badges TEXT[] DEFAULT ARRAY[]::TEXT[],
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (user_id)
        );
      `;
    })().catch(error => {
      userMetricsBootstrapPromise = undefined;
      console.error('Failed to bootstrap user_metrics table:', error);
      throw error;
    });
  }

  return userMetricsBootstrapPromise;
}

export function bootstrapBookingsTable() {
  if (!bookingsBootstrapPromise) {
    bookingsBootstrapPromise = (async () => {
      await bootstrapListingsTable();
      await bootstrapUsersTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS bookings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
          renter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          host_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          total_price NUMERIC NOT NULL,
          currency TEXT NOT NULL DEFAULT 'USD',
          status TEXT NOT NULL DEFAULT 'pending',
          notes TEXT,
          cancellation_reason TEXT,
          cancellation_by TEXT,
          cancelled_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CHECK (end_date >= start_date)
        );
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS start_datetime TIMESTAMPTZ NULL;
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS end_datetime TIMESTAMPTZ NULL;
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS rental_days INTEGER NULL;
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS duration_hours NUMERIC NULL;
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS booking_mode TEXT NULL;
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS event_city TEXT NULL;
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS event_state TEXT NULL;
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS event_postal_code TEXT NULL;
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS event_full_address TEXT NULL;
      `;

      // Stripe payment columns
      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS stripe_session_id TEXT NULL;
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT NULL;
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT NULL;
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ NULL;
      `;

      // Fee breakdown columns
      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 0;
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS service_fee NUMERIC DEFAULT 0;
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS is_pickup BOOLEAN DEFAULT TRUE;
      `;

      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS delivery_address TEXT NULL;
      `;

      // Upsells JSON storage
      await sql`
        ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS upsells JSONB DEFAULT '[]'::jsonb;
      `;
    })().catch(error => {
      bookingsBootstrapPromise = undefined;
      console.error('Failed to bootstrap bookings table:', error);
      throw error;
    });
  }

  return bookingsBootstrapPromise;
}

export function bootstrapAvailabilityBlocksTable() {
  if (!availabilityBlocksBootstrapPromise) {
    availabilityBlocksBootstrapPromise = (async () => {
      await bootstrapListingsTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS availability_blocks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          reason TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CHECK (end_date >= start_date)
        );
      `;
    })().catch(error => {
      availabilityBlocksBootstrapPromise = undefined;
      console.error('Failed to bootstrap availability_blocks table:', error);
      throw error;
    });
  }

  return availabilityBlocksBootstrapPromise;
}

export function bootstrapListingBookingRulesTable() {
  if (!listingBookingRulesBootstrapPromise) {
    listingBookingRulesBootstrapPromise = (async () => {
      await bootstrapListingsTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS listing_booking_rules (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
          min_days_notice INTEGER DEFAULT 0,
          max_future_days INTEGER DEFAULT 365,
          min_rental_days INTEGER DEFAULT 1,
          max_rental_days INTEGER DEFAULT 30,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (listing_id)
        );
      `;
    })().catch(error => {
      listingBookingRulesBootstrapPromise = undefined;
      console.error('Failed to bootstrap listing_booking_rules table:', error);
      throw error;
    });
  }

  return listingBookingRulesBootstrapPromise;
}

export function bootstrapEventProPackagesTable() {
  if (!eventProPackagesBootstrapPromise) {
    eventProPackagesBootstrapPromise = (async () => {
      await bootstrapListingsTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      // event_pro_packages is the canonical source of truth for Event Pro offerings surfaced on listings and bookings.
      await sql`
        CREATE TABLE IF NOT EXISTS event_pro_packages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          base_price NUMERIC NOT NULL,
          max_guests INTEGER NULL,
          included_items TEXT NULL,
          duration_hours NUMERIC NULL,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          sort_order INTEGER NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
    })().catch(error => {
      eventProPackagesBootstrapPromise = undefined;
      console.error('Failed to bootstrap event_pro_packages table:', error);
      throw error;
    });
  }

  return eventProPackagesBootstrapPromise;
}

export function bootstrapMessageThreadsTable() {
  if (!messageThreadsBootstrapPromise) {
    messageThreadsBootstrapPromise = (async () => {
      await bootstrapBookingsTable();
      await bootstrapUsersTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS message_threads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
          host_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          renter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          last_message_at TIMESTAMPTZ,
          last_message_preview TEXT,
          host_unread_count INTEGER DEFAULT 0,
          renter_unread_count INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
    })().catch(error => {
      messageThreadsBootstrapPromise = undefined;
      console.error('Failed to bootstrap message_threads table:', error);
      throw error;
    });
  }

  return messageThreadsBootstrapPromise;
}

export function bootstrapMessagesTable() {
  if (!messagesBootstrapPromise) {
    messagesBootstrapPromise = (async () => {
      await bootstrapMessageThreadsTable();
      await bootstrapUsersTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
          sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          body TEXT NOT NULL,
          message_type TEXT NOT NULL DEFAULT 'text',
          is_read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
    })().catch(error => {
      messagesBootstrapPromise = undefined;
      console.error('Failed to bootstrap messages table:', error);
      throw error;
    });
  }

  return messagesBootstrapPromise;
}

export function bootstrapNotificationsTable() {
  if (!notificationsBootstrapPromise) {
    notificationsBootstrapPromise = (async () => {
      await bootstrapUsersTable();
      await bootstrapBookingsTable();
      await bootstrapMessageThreadsTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          title TEXT,
          body TEXT,
          booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
          thread_id UUID REFERENCES message_threads(id) ON DELETE SET NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
    })().catch(error => {
      notificationsBootstrapPromise = undefined;
      console.error('Failed to bootstrap notifications table:', error);
      throw error;
    });
  }

  return notificationsBootstrapPromise;
}

// ============================================================================
// SALE TRANSACTIONS TABLE - Core sales workflow
// ============================================================================
export function bootstrapSaleTransactionsTable() {
  if (!saleTransactionsBootstrapPromise) {
    saleTransactionsBootstrapPromise = (async () => {
      await bootstrapListingsTable();
      await bootstrapUsersTable();
      await bootstrapMessageThreadsTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS sale_transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
          seller_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          buyer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          message_thread_id UUID REFERENCES message_threads(id) ON DELETE SET NULL,
          
          -- Pricing
          asking_price NUMERIC NOT NULL,
          offer_amount NUMERIC,
          final_price NUMERIC,
          
          -- Commission and fees (13% seller commission, 0% buyer fee)
          seller_commission_rate NUMERIC NOT NULL DEFAULT 0.13,
          seller_commission_amount NUMERIC,
          processing_fee_amount NUMERIC DEFAULT 0,
          seller_payout_amount NUMERIC,
          
          -- State machine
          status TEXT NOT NULL DEFAULT 'UnderOffer',
          
          -- Payment
          payment_method TEXT,
          payment_intent_id TEXT,
          payment_confirmed_at TIMESTAMPTZ,
          
          -- Transfer logistics
          transfer_method TEXT, -- 'pickup' or 'shipping'
          pickup_scheduled_at TIMESTAMPTZ,
          shipping_tracking_number TEXT,
          shipping_carrier TEXT,
          
          -- Confirmations
          buyer_confirmed_at TIMESTAMPTZ,
          buyer_confirmed_notes TEXT,
          seller_confirmed_at TIMESTAMPTZ,
          seller_confirmed_notes TEXT,
          
          -- Escrow
          escrow_held_at TIMESTAMPTZ,
          escrow_released_at TIMESTAMPTZ,
          
          -- Cancellation
          canceled_at TIMESTAMPTZ,
          canceled_by TEXT,
          cancellation_reason TEXT,
          
          -- State history (JSON array)
          state_history JSONB DEFAULT '[]'::jsonb,
          
          -- Timestamps
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
      
      // Add indexes for common queries
      await sql`CREATE INDEX IF NOT EXISTS idx_sale_transactions_listing ON sale_transactions(listing_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_sale_transactions_seller ON sale_transactions(seller_user_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_sale_transactions_buyer ON sale_transactions(buyer_user_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_sale_transactions_status ON sale_transactions(status);`;
    })().catch(error => {
      saleTransactionsBootstrapPromise = undefined;
      console.error('Failed to bootstrap sale_transactions table:', error);
      throw error;
    });
  }

  return saleTransactionsBootstrapPromise;
}

// ============================================================================
// SALE UPSELLS TABLE - Attached upsells per transaction
// ============================================================================
export function bootstrapSaleUpsellsTable() {
  if (!saleUpsellsBootstrapPromise) {
    saleUpsellsBootstrapPromise = (async () => {
      await bootstrapSaleTransactionsTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS sale_upsells (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          sale_transaction_id UUID NOT NULL REFERENCES sale_transactions(id) ON DELETE CASCADE,
          
          -- Upsell type: 'inspection', 'shipping', 'notary', 'title_verification', 'branding_kit'
          upsell_type TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          price NUMERIC NOT NULL,
          
          -- Status tracking
          status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, canceled
          
          -- Provider info (for third-party services)
          provider_name TEXT,
          provider_reference TEXT,
          
          -- Completion
          completed_at TIMESTAMPTZ,
          notes TEXT,
          
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
      
      await sql`CREATE INDEX IF NOT EXISTS idx_sale_upsells_transaction ON sale_upsells(sale_transaction_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_sale_upsells_type ON sale_upsells(upsell_type);`;
    })().catch(error => {
      saleUpsellsBootstrapPromise = undefined;
      console.error('Failed to bootstrap sale_upsells table:', error);
      throw error;
    });
  }

  return saleUpsellsBootstrapPromise;
}

// ============================================================================
// LISTING DOCUMENTS TABLE - For title, VIN, inspection reports
// ============================================================================
export function bootstrapListingDocumentsTable() {
  if (!listingDocumentsBootstrapPromise) {
    listingDocumentsBootstrapPromise = (async () => {
      await bootstrapListingsTable();
      await bootstrapUsersTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS listing_documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
          uploaded_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
          
          -- Document type: 'title', 'vin', 'inspection_report', 'maintenance_record', 'photo', 'video', 'other'
          document_type TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          
          -- File storage
          file_url TEXT NOT NULL,
          file_key TEXT, -- S3 key
          file_size INTEGER,
          mime_type TEXT,
          
          -- Verification
          is_verified BOOLEAN DEFAULT FALSE,
          verified_by TEXT,
          verified_at TIMESTAMPTZ,
          
          -- Visibility
          is_public BOOLEAN DEFAULT FALSE, -- Public = shown to all buyers
          
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
      
      await sql`CREATE INDEX IF NOT EXISTS idx_listing_documents_listing ON listing_documents(listing_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_listing_documents_type ON listing_documents(document_type);`;
    })().catch(error => {
      listingDocumentsBootstrapPromise = undefined;
      console.error('Failed to bootstrap listing_documents table:', error);
      throw error;
    });
  }

  return listingDocumentsBootstrapPromise;
}

// ============================================================================
// REVIEWS TABLE
// ============================================================================
let reviewsBootstrapPromise;

// ============================================================================
// LISTING SPECIFICATIONS TABLE - Vehicle/Equipment details
// ============================================================================
export function bootstrapListingSpecificationsTable() {
  if (!listingSpecificationsBootstrapPromise) {
    listingSpecificationsBootstrapPromise = (async () => {
      await bootstrapListingsTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS listing_specifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
          length_feet NUMERIC,
          width_feet NUMERIC,
          height_feet NUMERIC,
          weight_lbs NUMERIC,
          power_type TEXT,
          electrical_requirements TEXT,
          water_system TEXT,
          fresh_water_capacity_gallons NUMERIC,
          grey_water_capacity_gallons NUMERIC,
          ventilation_info TEXT,
          capacity_served INTEGER,
          equipment_classification TEXT,
          vending_window_count INTEGER,
          generator_included BOOLEAN DEFAULT FALSE,
          pos_system_included BOOLEAN DEFAULT FALSE,
          hand_wash_sink_included BOOLEAN DEFAULT FALSE,
          wheelchair_accessible BOOLEAN DEFAULT FALSE,
          commercial_grade_electrical BOOLEAN DEFAULT FALSE,
          certified_kitchen_rating TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(listing_id)
        );
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_listing_specs_listing ON listing_specifications(listing_id);`;
    })().catch(error => {
      listingSpecificationsBootstrapPromise = undefined;
      console.error('Failed to bootstrap listing_specifications table:', error);
      throw error;
    });
  }
  return listingSpecificationsBootstrapPromise;
}

// ============================================================================
// LISTING AVAILABILITY TABLE - Calendar and booking windows
// ============================================================================
export function bootstrapListingAvailabilityTable() {
  if (!listingAvailabilityBootstrapPromise) {
    listingAvailabilityBootstrapPromise = (async () => {
      await bootstrapListingsTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS listing_availability (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
          blackout_dates JSONB DEFAULT '[]'::jsonb,
          blackout_ranges JSONB DEFAULT '[]'::jsonb,
          weekday_availability JSONB DEFAULT '{"mon":true,"tue":true,"wed":true,"thu":true,"fri":true,"sat":true,"sun":true}'::jsonb,
          event_hours JSONB DEFAULT '{"start":"09:00","end":"22:00"}'::jsonb,
          minimum_rental_hours NUMERIC DEFAULT 1,
          maximum_rental_hours NUMERIC,
          minimum_rental_days INTEGER DEFAULT 1,
          maximum_rental_days INTEGER,
          lead_time_days INTEGER DEFAULT 1,
          instant_book_enabled BOOLEAN DEFAULT FALSE,
          always_available BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(listing_id)
        );
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_listing_avail_listing ON listing_availability(listing_id);`;
    })().catch(error => {
      listingAvailabilityBootstrapPromise = undefined;
      console.error('Failed to bootstrap listing_availability table:', error);
      throw error;
    });
  }
  return listingAvailabilityBootstrapPromise;
}

// ============================================================================
// LISTING PRICING TABLE - Rates, fees, deposits, add-ons
// ============================================================================
export function bootstrapListingPricingTable() {
  if (!listingPricingBootstrapPromise) {
    listingPricingBootstrapPromise = (async () => {
      await bootstrapListingsTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS listing_pricing (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
          base_hourly_price NUMERIC,
          base_daily_price NUMERIC,
          flat_event_price NUMERIC,
          tier_pricing JSONB DEFAULT '[]'::jsonb,
          addon_items JSONB DEFAULT '[]'::jsonb,
          deposit_required BOOLEAN DEFAULT FALSE,
          deposit_amount NUMERIC DEFAULT 0,
          cleaning_fee NUMERIC DEFAULT 0,
          damage_waiver NUMERIC DEFAULT 0,
          multi_day_discount_percent NUMERIC DEFAULT 0,
          sale_price NUMERIC,
          delivery_flat_fee NUMERIC DEFAULT 0,
          delivery_rate_per_mile NUMERIC DEFAULT 0,
          delivery_included_miles NUMERIC DEFAULT 0,
          delivery_minimum_fee NUMERIC DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(listing_id)
        );
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_listing_pricing_listing ON listing_pricing(listing_id);`;
    })().catch(error => {
      listingPricingBootstrapPromise = undefined;
      console.error('Failed to bootstrap listing_pricing table:', error);
      throw error;
    });
  }
  return listingPricingBootstrapPromise;
}

// ============================================================================
// LISTING LOCATION TABLE - Coordinates and service area
// ============================================================================
export function bootstrapListingLocationTable() {
  if (!listingLocationBootstrapPromise) {
    listingLocationBootstrapPromise = (async () => {
      await bootstrapListingsTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS listing_location (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
          latitude NUMERIC,
          longitude NUMERIC,
          masked_address TEXT,
          full_address TEXT,
          zip_code TEXT,
          city TEXT,
          state TEXT,
          country TEXT DEFAULT 'US',
          service_radius_miles NUMERIC DEFAULT 25,
          delivery_enabled BOOLEAN DEFAULT FALSE,
          delivery_range_miles NUMERIC,
          delivery_model TEXT DEFAULT 'pickup_only',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(listing_id)
        );
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_listing_location_listing ON listing_location(listing_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_listing_location_coords ON listing_location(latitude, longitude);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_listing_location_city ON listing_location(city, state);`;
    })().catch(error => {
      listingLocationBootstrapPromise = undefined;
      console.error('Failed to bootstrap listing_location table:', error);
      throw error;
    });
  }
  return listingLocationBootstrapPromise;
}

// ============================================================================
// LISTING MEDIA TABLE - Images, videos, gallery
// ============================================================================
export function bootstrapListingMediaTable() {
  if (!listingMediaBootstrapPromise) {
    listingMediaBootstrapPromise = (async () => {
      await bootstrapListingsTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS listing_media (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
          media_type TEXT NOT NULL DEFAULT 'image',
          url TEXT NOT NULL,
          file_key TEXT,
          is_hero BOOLEAN DEFAULT FALSE,
          sort_order INTEGER DEFAULT 0,
          alt_text TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_listing_media_listing ON listing_media(listing_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_listing_media_hero ON listing_media(listing_id, is_hero);`;
    })().catch(error => {
      listingMediaBootstrapPromise = undefined;
      console.error('Failed to bootstrap listing_media table:', error);
      throw error;
    });
  }
  return listingMediaBootstrapPromise;
}

// ============================================================================
// LISTING COMPLIANCE TABLE - Documents and verification
// ============================================================================
export function bootstrapListingComplianceTable() {
  if (!listingComplianceBootstrapPromise) {
    listingComplianceBootstrapPromise = (async () => {
      await bootstrapListingsTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS listing_compliance (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
          document_uploads JSONB DEFAULT '[]'::jsonb,
          document_category_group TEXT,
          permit_required BOOLEAN DEFAULT FALSE,
          insurance_required BOOLEAN DEFAULT FALSE,
          title_document_url TEXT,
          vin_or_serial_number TEXT,
          inspection_report_url TEXT,
          notary_service_available BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(listing_id)
        );
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_listing_compliance_listing ON listing_compliance(listing_id);`;
    })().catch(error => {
      listingComplianceBootstrapPromise = undefined;
      console.error('Failed to bootstrap listing_compliance table:', error);
      throw error;
    });
  }
  return listingComplianceBootstrapPromise;
}

// ============================================================================
// USER LISTINGS TABLE - Links users to their listings
// ============================================================================
export function bootstrapUserListingsTable() {
  if (!userListingsBootstrapPromise) {
    userListingsBootstrapPromise = (async () => {
      await bootstrapUsersTable();
      await bootstrapListingsTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS user_listings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
          listing_status TEXT NOT NULL DEFAULT 'draft',
          is_primary_owner BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(user_id, listing_id)
        );
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_user_listings_user ON user_listings(user_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_user_listings_listing ON user_listings(listing_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_user_listings_status ON user_listings(listing_status);`;
    })().catch(error => {
      userListingsBootstrapPromise = undefined;
      console.error('Failed to bootstrap user_listings table:', error);
      throw error;
    });
  }
  return userListingsBootstrapPromise;
}

export function bootstrapReviewsTable() {
  if (!reviewsBootstrapPromise) {
    reviewsBootstrapPromise = (async () => {
      await bootstrapListingsTable();
      await bootstrapUsersTable();
      await bootstrapBookingsTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS reviews (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
          booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
          reviewer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          reviewee_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          review_type TEXT NOT NULL DEFAULT 'listing',
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          title TEXT,
          body TEXT,
          is_public BOOLEAN DEFAULT TRUE,
          host_response TEXT,
          host_response_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_reviews_listing ON reviews(listing_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_user_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);`;
    })().catch(error => {
      reviewsBootstrapPromise = undefined;
      console.error('Failed to bootstrap reviews table:', error);
      throw error;
    });
  }
  return reviewsBootstrapPromise;
}

// ============================================================================
// WISHLIST TABLE
// ============================================================================
let wishlistBootstrapPromise;

export function bootstrapWishlistTable() {
  if (!wishlistBootstrapPromise) {
    wishlistBootstrapPromise = (async () => {
      await bootstrapListingsTable();
      await bootstrapUsersTable();
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS wishlists (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(user_id, listing_id)
        );
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlists(user_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_wishlist_listing ON wishlists(listing_id);`;
    })().catch(error => {
      wishlistBootstrapPromise = undefined;
      console.error('Failed to bootstrap wishlists table:', error);
      throw error;
    });
  }
  return wishlistBootstrapPromise;
}

// ============================================================================
// ANALYTICS EVENTS TABLE
// ============================================================================
let analyticsEventsBootstrapPromise;

export function bootstrapAnalyticsEventsTable() {
  if (!analyticsEventsBootstrapPromise) {
    analyticsEventsBootstrapPromise = (async () => {
      await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      await sql`
        CREATE TABLE IF NOT EXISTS analytics_events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          event_type TEXT NOT NULL,
          user_id UUID,
          listing_id UUID,
          booking_id UUID,
          session_id TEXT,
          properties JSONB DEFAULT '{}'::jsonb,
          user_agent TEXT,
          ip_address TEXT,
          referrer TEXT,
          url TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_analytics_listing ON analytics_events(listing_id);`;
    })().catch(error => {
      analyticsEventsBootstrapPromise = undefined;
      console.error('Failed to bootstrap analytics_events table:', error);
      throw error;
    });
  }
  return analyticsEventsBootstrapPromise;
}

// ============================================================================
// BOOKING STATUS CONSTANTS
// ============================================================================
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  HOST_APPROVED: 'HOST_APPROVED',
  PAID: 'PAID',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  DECLINED: 'DECLINED',
  CANCELED: 'CANCELED',
  DISPUTED: 'DISPUTED',
  EXPIRED: 'EXPIRED'
};

// Valid state transitions
export const BOOKING_TRANSITIONS = {
  [BOOKING_STATUS.PENDING]: [BOOKING_STATUS.HOST_APPROVED, BOOKING_STATUS.DECLINED, BOOKING_STATUS.CANCELED, BOOKING_STATUS.EXPIRED],
  [BOOKING_STATUS.HOST_APPROVED]: [BOOKING_STATUS.PAID, BOOKING_STATUS.CANCELED, BOOKING_STATUS.EXPIRED],
  [BOOKING_STATUS.PAID]: [BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.CANCELED, BOOKING_STATUS.DISPUTED],
  [BOOKING_STATUS.IN_PROGRESS]: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.DISPUTED],
  [BOOKING_STATUS.COMPLETED]: [BOOKING_STATUS.DISPUTED],
  [BOOKING_STATUS.DECLINED]: [],
  [BOOKING_STATUS.CANCELED]: [],
  [BOOKING_STATUS.DISPUTED]: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELED],
  [BOOKING_STATUS.EXPIRED]: []
};

// Check if transition is valid
export function canTransitionBooking(fromStatus, toStatus) {
  const allowedTransitions = BOOKING_TRANSITIONS[fromStatus] || [];
  return allowedTransitions.includes(toStatus);
}

// ============================================================================
// SALE STATUS CONSTANTS
// ============================================================================
export const SALE_STATUS = {
  UNDER_OFFER: 'UnderOffer',
  OFFER_ACCEPTED: 'OfferAccepted',
  PAYMENT_HELD: 'PaymentHeld',
  IN_TRANSFER: 'InTransfer',
  BUYER_CONFIRMED: 'BuyerConfirmed',
  COMPLETED: 'Completed',
  DECLINED: 'Declined',
  CANCELED: 'Canceled',
  DISPUTED: 'Disputed'
};

export const SALE_TRANSITIONS = {
  [SALE_STATUS.UNDER_OFFER]: [SALE_STATUS.OFFER_ACCEPTED, SALE_STATUS.DECLINED, SALE_STATUS.CANCELED],
  [SALE_STATUS.OFFER_ACCEPTED]: [SALE_STATUS.PAYMENT_HELD, SALE_STATUS.CANCELED],
  [SALE_STATUS.PAYMENT_HELD]: [SALE_STATUS.IN_TRANSFER, SALE_STATUS.DISPUTED, SALE_STATUS.CANCELED],
  [SALE_STATUS.IN_TRANSFER]: [SALE_STATUS.BUYER_CONFIRMED, SALE_STATUS.DISPUTED],
  [SALE_STATUS.BUYER_CONFIRMED]: [SALE_STATUS.COMPLETED, SALE_STATUS.DISPUTED],
  [SALE_STATUS.COMPLETED]: [],
  [SALE_STATUS.DECLINED]: [],
  [SALE_STATUS.CANCELED]: [],
  [SALE_STATUS.DISPUTED]: [SALE_STATUS.COMPLETED, SALE_STATUS.CANCELED]
};

export function canTransitionSale(fromStatus, toStatus) {
  const allowedTransitions = SALE_TRANSITIONS[fromStatus] || [];
  return allowedTransitions.includes(toStatus);
}

// ============================================================================
// FEE CALCULATION CONSTANTS
// ============================================================================
export const FEE_RATES = {
  RENTER_SERVICE_FEE: 0.13,    // 13% charged to renter
  HOST_COMMISSION: 0.10,       // 10% taken from host payout
  SELLER_COMMISSION: 0.13,     // 13% for sales
  STRIPE_PROCESSING: 0.029,    // 2.9% Stripe fee
  STRIPE_FIXED: 0.30           // $0.30 Stripe fixed fee
};

export function calculateBookingFees({ basePrice, rentalDays = 1, deliveryFee = 0, upsells = [] }) {
  const subtotal = basePrice * rentalDays;
  const upsellTotal = upsells.reduce((sum, u) => sum + (u.price || 0), 0);
  const taxableAmount = subtotal + deliveryFee;
  const serviceFee = Math.round(taxableAmount * FEE_RATES.RENTER_SERVICE_FEE * 100) / 100;
  const total = Math.round((subtotal + deliveryFee + upsellTotal + serviceFee) * 100) / 100;
  const hostCommission = Math.round(subtotal * FEE_RATES.HOST_COMMISSION * 100) / 100;
  const hostPayout = Math.round((subtotal - hostCommission) * 100) / 100;

  return {
    subtotal,
    rentalDays,
    deliveryFee,
    upsellTotal,
    serviceFee,
    total,
    hostCommission,
    hostPayout,
    platformRevenue: serviceFee + hostCommission
  };
}

export function calculateSaleFees({ salePrice }) {
  const sellerCommission = Math.round(salePrice * FEE_RATES.SELLER_COMMISSION * 100) / 100;
  const sellerPayout = Math.round((salePrice - sellerCommission) * 100) / 100;
  const stripeProcessing = Math.round((salePrice * FEE_RATES.STRIPE_PROCESSING + FEE_RATES.STRIPE_FIXED) * 100) / 100;

  return {
    salePrice,
    sellerCommission,
    sellerPayout,
    stripeProcessing,
    platformRevenue: sellerCommission
  };
}

// ============================================================================
// LISTING CATEGORY AND TYPE CONSTANTS
// ============================================================================
export const LISTING_MODES = {
  RENTAL: 'rental',
  EVENT_PRO: 'event_pro',
  EQUIPMENT: 'equipment',
  FOR_SALE: 'for_sale'
};

export const LISTING_CATEGORIES = {
  FOOD_TRUCK: 'food_truck',
  FOOD_TRAILER: 'food_trailer',
  GHOST_KITCHEN: 'ghost_kitchen',
  EQUIPMENT_RENTAL: 'equipment_rental',
  VENDOR_EVENT_SPACE: 'vendor_event_space',
  EVENT_PRO_SERVICE: 'event_pro_service',
  FOR_SALE_INVENTORY: 'for_sale_inventory'
};

export const EQUIPMENT_TYPES = {
  GENERATOR: 'generator',
  SMOKER: 'smoker',
  POS_TERMINAL: 'pos_terminal',
  TENT_CANOPY: 'tent_canopy',
  LIGHTING: 'lighting',
  WATER_TANK: 'water_tank',
  COOKWARE: 'cookware',
  OTHER: 'other_equipment'
};

export const EVENT_PRO_TYPES = {
  CATERING: 'catering',
  BARTENDING: 'bartending',
  COFFEE_BEVERAGE: 'coffee_beverage',
  DESSERT_SWEETS: 'dessert_sweets',
  DJ_ENTERTAINMENT: 'dj_entertainment',
  OTHER: 'other_services'
};

export const VENDOR_SPACE_TYPES = {
  STANDARD_BOOTH: 'standard_booth',
  CORNER_BOOTH: 'corner_booth',
  FOOD_VENDOR_ZONE: 'food_vendor_zone',
  TRUCK_PARKING: 'truck_parking',
  ARTISAN_MARKET: 'artisan_market'
};

export const DOCUMENT_CATEGORIES = {
  COMPLIANCE: 'compliance',
  LEGAL: 'legal',
  MARKETING: 'marketing'
};

export const PRICING_MODELS = {
  HOURLY: 'hourly',
  DAILY: 'daily',
  FLAT_RATE: 'flat_rate',
  PACKAGE_TIER: 'package_tier'
};

export const DELIVERY_MODELS = {
  PICKUP_ONLY: 'pickup_only',
  FLAT_FEE: 'flat_fee',
  MILEAGE_BASED: 'mileage_based',
  DELIVERY_INCLUDED: 'delivery_included'
};

export const LISTING_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  SOLD: 'sold',
  ARCHIVED: 'archived'
};

// ============================================================================
// BOOTSTRAP ALL CREATIVE LISTING TABLES
// ============================================================================
export async function bootstrapCreativeListingTables() {
  await Promise.all([
    bootstrapListingsTable(),
    bootstrapUsersTable()
  ]);
  
  await Promise.all([
    bootstrapListingSpecificationsTable(),
    bootstrapListingAvailabilityTable(),
    bootstrapListingPricingTable(),
    bootstrapListingLocationTable(),
    bootstrapListingMediaTable(),
    bootstrapListingComplianceTable(),
    bootstrapUserListingsTable()
  ]);
}
