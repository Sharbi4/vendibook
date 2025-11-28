-- Vendibook PostgreSQL Database Schema for Neon
-- Complete schema for mobile commerce marketplace

-- ============================================================================
-- ENUMS AND TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM ('renter', 'host', 'seller', 'buyer', 'event_pro', 'admin');

CREATE TYPE listing_category AS ENUM (
  'food_truck',
  'food_trailer',
  'ghost_kitchen',
  'stall',
  'vending_lot',
  'chef_service',
  'event_pro_service',
  'for_sale'
);

CREATE TYPE booking_state AS ENUM (
  'Requested',
  'HostApproved',
  'Paid',
  'InProgress',
  'ReturnedPendingConfirmation',
  'Completed',
  'Canceled'
);

CREATE TYPE sales_state AS ENUM (
  'Listed',
  'UnderOffer',
  'OfferAccepted',
  'PaymentPending',
  'Paid',
  'InTransfer',
  'Completed',
  'Canceled'
);

CREATE TYPE power_type AS ENUM ('propane', 'electric', 'generator', 'hybrid');

CREATE TYPE delivery_option AS ENUM ('free_delivery', 'paid_delivery', 'pickup_required', 'out_of_range');

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL, -- Clerk authentication ID
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  roles user_role[] DEFAULT ARRAY['renter']::user_role[], -- Users can have multiple roles
  avatar_url TEXT,
  bio TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- LISTINGS TABLE (Rentals and For Sale)
-- ============================================================================

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Basic Info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category listing_category NOT NULL,

  -- Location (masked until payment for rentals)
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT DEFAULT 'USA',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Equipment Specs
  length_feet DECIMAL(5, 2),
  width_feet DECIMAL(5, 2),
  height_feet DECIMAL(5, 2),
  power_type power_type,
  power_requirements TEXT,
  water_hookup BOOLEAN DEFAULT FALSE,
  propane_included BOOLEAN DEFAULT FALSE,
  equipment_list TEXT[], -- Array of equipment items

  -- Pricing (for rentals)
  daily_rate DECIMAL(10, 2),
  weekly_rate DECIMAL(10, 2),
  monthly_rate DECIMAL(10, 2),

  -- Sale Price (for sales)
  sale_price DECIMAL(10, 2),

  -- Delivery Settings (for rentals)
  free_delivery_radius_miles DECIMAL(5, 2),
  paid_delivery_radius_miles DECIMAL(5, 2),
  delivery_price_per_mile DECIMAL(5, 2),
  max_delivery_distance_miles DECIMAL(5, 2),
  pickup_required BOOLEAN DEFAULT FALSE,

  -- Media
  images TEXT[], -- Array of image URLs
  video_url TEXT,

  -- Availability
  available BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,

  -- Compliance
  compliance_documents TEXT[], -- Array of document URLs

  -- Metadata
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listings_host_id ON listings(host_id);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_available ON listings(available);
CREATE INDEX idx_listings_location ON listings(city, state);

-- ============================================================================
-- BOOKINGS TABLE (Rental Transactions)
-- ============================================================================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parties
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  renter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  host_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rental_days INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,

  -- Delivery Address (from renter)
  delivery_address TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  delivery_state TEXT NOT NULL,
  delivery_zip TEXT NOT NULL,
  delivery_latitude DECIMAL(10, 8),
  delivery_longitude DECIMAL(11, 8),

  -- Pricing Breakdown
  base_price DECIMAL(10, 2) NOT NULL, -- Daily/weekly rate * days
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  delivery_distance_miles DECIMAL(5, 2),
  delivery_option delivery_option,

  -- Upsells
  upsell_items JSONB DEFAULT '[]', -- [{name, price, description}]
  upsell_total DECIMAL(10, 2) DEFAULT 0,

  -- Fee Calculation
  subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (base_price + delivery_fee + upsell_total) STORED,
  renter_service_fee DECIMAL(10, 2) GENERATED ALWAYS AS (ROUND((base_price + delivery_fee + upsell_total) * 0.13, 2)) STORED, -- 13%
  total_renter_pays DECIMAL(10, 2) GENERATED ALWAYS AS (ROUND((base_price + delivery_fee + upsell_total) * 1.13, 2)) STORED,
  host_commission DECIMAL(10, 2) GENERATED ALWAYS AS (ROUND((base_price + delivery_fee + upsell_total) * 0.10, 2)) STORED, -- 10%
  payment_processor_fee DECIMAL(10, 2) DEFAULT 0,
  host_payout DECIMAL(10, 2), -- Calculated on completion: subtotal - host_commission - payment_processor_fee

  -- State Machine
  state booking_state DEFAULT 'Requested',
  state_history JSONB DEFAULT '[]', -- [{state, timestamp, notes}]

  -- Access Instructions (unlocked after payment)
  access_instructions TEXT,

  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_listing_id ON bookings(listing_id);
CREATE INDEX idx_bookings_renter_id ON bookings(renter_id);
CREATE INDEX idx_bookings_host_id ON bookings(host_id);
CREATE INDEX idx_bookings_state ON bookings(state);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);

-- ============================================================================
-- SALES TABLE (Equipment Sales Transactions)
-- ============================================================================

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parties
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id),

  -- Pricing
  sale_price DECIMAL(10, 2) NOT NULL,

  -- Upsells (shipping, inspection, notary, etc.)
  upsell_items JSONB DEFAULT '[]', -- [{name, price, description}]
  upsell_total DECIMAL(10, 2) DEFAULT 0,

  -- Fee Calculation
  subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (sale_price + upsell_total) STORED,
  buyer_service_fee DECIMAL(10, 2) DEFAULT 0, -- Buyers pay 0%
  total_buyer_pays DECIMAL(10, 2) GENERATED ALWAYS AS (sale_price + upsell_total) STORED,
  seller_commission DECIMAL(10, 2) GENERATED ALWAYS AS (ROUND((sale_price + upsell_total) * 0.13, 2)) STORED, -- 13%
  payment_processor_fee DECIMAL(10, 2) DEFAULT 0,
  seller_payout DECIMAL(10, 2), -- Calculated on completion: subtotal - seller_commission - payment_processor_fee

  -- Offer Details
  offer_amount DECIMAL(10, 2),
  offer_notes TEXT,

  -- State Machine
  state sales_state DEFAULT 'Listed',
  state_history JSONB DEFAULT '[]', -- [{state, timestamp, notes}]

  -- Timestamps
  listed_at TIMESTAMPTZ DEFAULT NOW(),
  offer_made_at TIMESTAMPTZ,
  offer_accepted_at TIMESTAMPTZ,
  payment_pending_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  in_transfer_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sales_listing_id ON sales(listing_id);
CREATE INDEX idx_sales_seller_id ON sales(seller_id);
CREATE INDEX idx_sales_buyer_id ON sales(buyer_id);
CREATE INDEX idx_sales_state ON sales(state);

-- ============================================================================
-- MESSAGES TABLE (State-based messaging)
-- ============================================================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Context (either booking_id or sale_id)
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,

  -- Parties
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Message
  message TEXT NOT NULL,

  -- Metadata
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: must belong to either booking or sale, not both
  CONSTRAINT message_context_check CHECK (
    (booking_id IS NOT NULL AND sale_id IS NULL) OR
    (booking_id IS NULL AND sale_id IS NOT NULL)
  )
);

CREATE INDEX idx_messages_booking_id ON messages(booking_id);
CREATE INDEX idx_messages_sale_id ON messages(sale_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);

-- ============================================================================
-- AVAILABILITY CALENDAR (for rentals)
-- ============================================================================

CREATE TABLE availability_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE, -- NULL for manual blocks

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  blocked BOOLEAN DEFAULT TRUE,
  reason TEXT, -- 'booking', 'manual_block', 'maintenance', etc.

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_availability_listing_id ON availability_blocks(listing_id);
CREATE INDEX idx_availability_dates ON availability_blocks(start_date, end_date);

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Context
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,

  -- Parties
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Review
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: must belong to either booking or sale
  CONSTRAINT review_context_check CHECK (
    (booking_id IS NOT NULL AND sale_id IS NULL) OR
    (booking_id IS NULL AND sale_id IS NOT NULL)
  )
);

CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_sale_id ON reviews(sale_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);

-- ============================================================================
-- PAYOUTS TABLE
-- ============================================================================

CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipient
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Source
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,

  -- Amount
  amount DECIMAL(10, 2) NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'

  -- External Payment Processor Info
  stripe_payout_id TEXT,

  -- Timestamps
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payouts_user_id ON payouts(user_id);
CREATE INDEX idx_payouts_booking_id ON payouts(booking_id);
CREATE INDEX idx_payouts_sale_id ON payouts(sale_id);
CREATE INDEX idx_payouts_status ON payouts(status);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: Automatically block availability when booking is paid
-- ============================================================================

CREATE OR REPLACE FUNCTION block_availability_on_booking_paid()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.state = 'Paid' AND OLD.state != 'Paid' THEN
    INSERT INTO availability_blocks (listing_id, booking_id, start_date, end_date, blocked, reason)
    VALUES (NEW.listing_id, NEW.id, NEW.start_date, NEW.end_date, TRUE, 'booking');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_block_availability_on_paid
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION block_availability_on_booking_paid();

-- ============================================================================
-- FUNCTION: Unblock availability when booking is completed or canceled
-- ============================================================================

CREATE OR REPLACE FUNCTION unblock_availability_on_booking_end()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.state = 'Completed' OR NEW.state = 'Canceled') AND (OLD.state != 'Completed' AND OLD.state != 'Canceled') THEN
    DELETE FROM availability_blocks WHERE booking_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_unblock_availability_on_end
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION unblock_availability_on_booking_end();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE users IS 'User accounts with multiple role support';
COMMENT ON TABLE listings IS 'Rental and for-sale equipment listings';
COMMENT ON TABLE bookings IS 'Rental transactions with 7-state lifecycle';
COMMENT ON TABLE sales IS 'Equipment sales transactions with 8-state lifecycle';
COMMENT ON TABLE messages IS 'State-based messaging locked after transaction completion';
COMMENT ON TABLE availability_blocks IS 'Calendar blocking for rental equipment';
COMMENT ON TABLE reviews IS 'Post-transaction reviews';
COMMENT ON TABLE payouts IS 'Host and seller payout tracking';

COMMENT ON COLUMN bookings.renter_service_fee IS 'Renters pay 13% service fee';
COMMENT ON COLUMN bookings.host_commission IS 'Hosts pay 10% commission';
COMMENT ON COLUMN sales.buyer_service_fee IS 'Buyers pay 0% service fee';
COMMENT ON COLUMN sales.seller_commission IS 'Sellers pay 13% commission';
