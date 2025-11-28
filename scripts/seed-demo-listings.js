/**
 * Seed Demo Listings to Neon Database
 * 
 * Run with: node scripts/seed-demo-listings.js
 */

import 'dotenv/config';
import { sql, bootstrapListingsTable } from '../src/api/db.js';

const DEMO_MARKER = '[Demo Listing]';

const demoListings = [
  // ============================================================================
  // RENTAL LISTINGS
  // ============================================================================
  {
    title: 'Fully Equipped Taco Truck - LA Style',
    description: `${DEMO_MARKER} Professional taco truck perfect for events, festivals, and daily operations. Fully equipped with commercial-grade appliances, fresh water system, and propane setup. Health department approved and ready to roll.`,
    listing_type: 'RENT',
    price: 250,
    city: 'Tucson',
    state: 'AZ',
    display_city: 'Tucson',
    display_state: 'AZ',
    display_zone_label: 'Central Tucson + 25 mi',
    service_zone_type: 'radius',
    service_radius_miles: 25,
    booking_mode: 'daily-with-time',
    default_start_time: '08:00',
    default_end_time: '20:00',
    full_street_address: '245 S Avenida del Convento, Tucson, AZ 85745',
    postal_code: '85745',
    latitude: 32.2191,
    longitude: -110.9893,
  },
  {
    title: 'Wood-Fired Pizza Trailer - Professional Setup',
    description: `${DEMO_MARKER} Authentic wood-fired pizza trailer with Italian imported oven. Perfect for weddings, corporate events, and festivals. Produces 80-100 pizzas per service. Reaches 900°F in just 20 minutes.`,
    listing_type: 'RENT',
    price: 180,
    city: 'Phoenix',
    state: 'AZ',
    display_city: 'Phoenix',
    display_state: 'AZ',
    display_zone_label: 'Phoenix Metro + 30 mi',
    service_zone_type: 'radius',
    service_radius_miles: 30,
    booking_mode: 'daily-with-time',
    default_start_time: '10:00',
    default_end_time: '22:00',
    full_street_address: '1234 N Central Ave, Phoenix, AZ 85004',
    postal_code: '85004',
    latitude: 33.4484,
    longitude: -112.0740,
  },
  {
    title: 'Premium Ghost Kitchen - 24/7 Access',
    description: `${DEMO_MARKER} Professional commercial kitchen space for delivery-only restaurant operations. Fully licensed and health department approved. Perfect for scaling your food business. Walk-in cooler and freezer included.`,
    listing_type: 'RENT',
    price: 150,
    city: 'Tucson',
    state: 'AZ',
    display_city: 'Tucson',
    display_state: 'AZ',
    display_zone_label: 'Downtown Tucson',
    service_zone_type: 'radius',
    service_radius_miles: 10,
    booking_mode: 'daily-with-time',
    default_start_time: '00:00',
    default_end_time: '23:59',
    full_street_address: '500 E Congress St, Tucson, AZ 85701',
    postal_code: '85701',
    latitude: 32.2217,
    longitude: -110.9658,
  },
  {
    title: 'Downtown Vending Location - High Traffic',
    description: `${DEMO_MARKER} Prime downtown location with 5,000+ daily foot traffic. Near ASU campus, office buildings, and retail. All permits included. Power and water hookups available on-site.`,
    listing_type: 'RENT',
    price: 120,
    city: 'Tempe',
    state: 'AZ',
    display_city: 'Tempe',
    display_state: 'AZ',
    display_zone_label: 'ASU Campus Area',
    service_zone_type: 'radius',
    service_radius_miles: 5,
    booking_mode: 'daily-with-time',
    default_start_time: '07:00',
    default_end_time: '21:00',
    full_street_address: '525 S Mill Ave, Tempe, AZ 85281',
    postal_code: '85281',
    latitude: 33.4255,
    longitude: -111.9400,
  },
  {
    title: 'BBQ Smoker Trailer - Competition Ready',
    description: `${DEMO_MARKER} Professional competition-grade BBQ smoker trailer. Large capacity for events up to 500 people. Temperature-controlled smoking chambers. Used by championship BBQ teams.`,
    listing_type: 'RENT',
    price: 220,
    city: 'Mesa',
    state: 'AZ',
    display_city: 'Mesa',
    display_state: 'AZ',
    display_zone_label: 'East Valley + 35 mi',
    service_zone_type: 'radius',
    service_radius_miles: 35,
    booking_mode: 'daily-with-time',
    default_start_time: '06:00',
    default_end_time: '23:00',
    full_street_address: '1234 E Main St, Mesa, AZ 85203',
    postal_code: '85203',
    latitude: 33.4152,
    longitude: -111.8315,
  },
  {
    title: 'Vintage Coffee Cart - Fully Restored',
    description: `${DEMO_MARKER} Beautifully restored vintage coffee cart perfect for weddings, corporate events, and pop-ups. Instagram-ready aesthetic with professional La Marzocco espresso equipment.`,
    listing_type: 'RENT',
    price: 95,
    city: 'Scottsdale',
    state: 'AZ',
    display_city: 'Scottsdale',
    display_state: 'AZ',
    display_zone_label: 'Scottsdale + 20 mi',
    service_zone_type: 'radius',
    service_radius_miles: 20,
    booking_mode: 'daily-with-time',
    default_start_time: '05:30',
    default_end_time: '14:00',
    full_street_address: '7014 E Camelback Rd, Scottsdale, AZ 85251',
    postal_code: '85251',
    latitude: 33.5092,
    longitude: -111.9280,
  },
  
  // ============================================================================
  // FOR SALE LISTINGS
  // ============================================================================
  {
    title: '2022 Food Truck - Like New Condition',
    description: `${DEMO_MARKER} 2022 Chevrolet P30 food truck with only 8,500 miles. Fully equipped commercial kitchen. Ready for immediate operation. Clean title, full inspection available. Financing options for qualified buyers.`,
    listing_type: 'SALE',
    price: 45000,
    city: 'Phoenix',
    state: 'AZ',
    display_city: 'Phoenix',
    display_state: 'AZ',
    display_zone_label: 'Central Phoenix',
    service_zone_type: 'radius',
    service_radius_miles: 50,
    booking_mode: 'daily-with-time',
    default_start_time: '09:00',
    default_end_time: '17:00',
    full_street_address: '2020 W Indian School Rd, Phoenix, AZ 85015',
    postal_code: '85015',
    latitude: 33.4950,
    longitude: -112.0900,
  },
  {
    title: 'Commercial Kitchen Equipment Set',
    description: `${DEMO_MARKER} Complete commercial kitchen equipment package including griddle, fryer, prep tables, and refrigeration. NSF certified and like-new condition. Perfect for outfitting a new food truck.`,
    listing_type: 'SALE',
    price: 8500,
    city: 'Phoenix',
    state: 'AZ',
    display_city: 'Phoenix',
    display_state: 'AZ',
    display_zone_label: 'West Phoenix',
    service_zone_type: 'radius',
    service_radius_miles: 100,
    booking_mode: 'daily-with-time',
    default_start_time: '08:00',
    default_end_time: '18:00',
    full_street_address: '3456 W Van Buren St, Phoenix, AZ 85009',
    postal_code: '85009',
    latitude: 33.4513,
    longitude: -112.1150,
  },
  {
    title: '2019 Pizza Trailer - Turn-Key Business',
    description: `${DEMO_MARKER} Fully operational pizza trailer with established customer base. Includes wood-fired oven, all equipment, and business contacts. Current owner retiring after 5 successful years. Training included.`,
    listing_type: 'SALE',
    price: 62000,
    city: 'Scottsdale',
    state: 'AZ',
    display_city: 'Scottsdale',
    display_state: 'AZ',
    display_zone_label: 'North Scottsdale',
    service_zone_type: 'radius',
    service_radius_miles: 40,
    booking_mode: 'daily-with-time',
    default_start_time: '10:00',
    default_end_time: '16:00',
    full_street_address: '8989 E Shea Blvd, Scottsdale, AZ 85260',
    postal_code: '85260',
    latitude: 33.5810,
    longitude: -111.8850,
  },
  
  // ============================================================================
  // EVENT PRO LISTINGS
  // ============================================================================
  {
    title: 'Award-Winning Chef - Mexican Cuisine',
    description: `${DEMO_MARKER} Professional chef specializing in authentic Mexican cuisine. Available for private events, catering, and menu development. Over 15 years experience. ServSafe certified with catering license.`,
    listing_type: 'EVENT_PRO',
    price: 75,
    city: 'Phoenix',
    state: 'AZ',
    display_city: 'Phoenix',
    display_state: 'AZ',
    display_zone_label: 'Phoenix Metro',
    service_zone_type: 'radius',
    service_radius_miles: 50,
    booking_mode: 'hourly',
    default_start_time: '08:00',
    default_end_time: '22:00',
    full_street_address: '1414 S Central Ave, Phoenix, AZ 85004',
    postal_code: '85004',
    latitude: 33.4400,
    longitude: -112.0740,
  },
  {
    title: 'Professional Caterer - Italian Cuisine',
    description: `${DEMO_MARKER} Full-service Italian catering for weddings, corporate events, and private parties. Custom menus, professional service staff, and complete event coordination. Wine pairing expertise available.`,
    listing_type: 'EVENT_PRO',
    price: 65,
    city: 'Scottsdale',
    state: 'AZ',
    display_city: 'Scottsdale',
    display_state: 'AZ',
    display_zone_label: 'Scottsdale + Valley',
    service_zone_type: 'radius',
    service_radius_miles: 45,
    booking_mode: 'hourly',
    default_start_time: '10:00',
    default_end_time: '23:00',
    full_street_address: '7373 E Scottsdale Mall, Scottsdale, AZ 85251',
    postal_code: '85251',
    latitude: 33.4942,
    longitude: -111.9261,
  },
  {
    title: 'Craft Coffee Barista - Specialty Drinks',
    description: `${DEMO_MARKER} SCA-certified barista specializing in specialty coffee service for corporate events, weddings, and private parties. Mobile espresso setup available. Latte art and custom drink menus.`,
    listing_type: 'EVENT_PRO',
    price: 50,
    city: 'Tempe',
    state: 'AZ',
    display_city: 'Tempe',
    display_state: 'AZ',
    display_zone_label: 'East Valley',
    service_zone_type: 'radius',
    service_radius_miles: 30,
    booking_mode: 'hourly',
    default_start_time: '06:00',
    default_end_time: '18:00',
    full_street_address: '680 S Mill Ave, Tempe, AZ 85281',
    postal_code: '85281',
    latitude: 33.4242,
    longitude: -111.9400,
  },
  {
    title: 'Event Staff Coordinator - Full Service',
    description: `${DEMO_MARKER} Professional event staffing and coordination. Experienced team for weddings, corporate events, and large gatherings. Licensed bartenders, professional servers, and event coordinators.`,
    listing_type: 'EVENT_PRO',
    price: 55,
    city: 'Mesa',
    state: 'AZ',
    display_city: 'Mesa',
    display_state: 'AZ',
    display_zone_label: 'East Valley + Phoenix',
    service_zone_type: 'radius',
    service_radius_miles: 40,
    booking_mode: 'hourly',
    default_start_time: '08:00',
    default_end_time: '02:00',
    full_street_address: '200 W Main St, Mesa, AZ 85201',
    postal_code: '85201',
    latitude: 33.4152,
    longitude: -111.8315,
  },
];

async function seedListings() {
  console.log('🌱 Starting to seed demo listings to Neon database...\n');
  
  try {
    // Bootstrap the listings table
    console.log('🔧 Bootstrapping listings table...');
    await bootstrapListingsTable();
    console.log('   ✅ Table ready\n');
    
    // Delete existing demo listings
    const markerPattern = `%${DEMO_MARKER}%`;
    console.log('🗑️  Clearing existing demo listings...');
    await sql`DELETE FROM listings WHERE description ILIKE ${markerPattern};`;
    console.log('   ✅ Cleared\n');
    
    // Insert new demo listings
    console.log('📦 Inserting demo listings...\n');
    
    for (const listing of demoListings) {
      await sql`
        INSERT INTO listings (
          title,
          description,
          city,
          state,
          price,
          listing_type,
          booking_mode,
          default_start_time,
          default_end_time,
          display_city,
          display_state,
          display_zone_label,
          service_zone_type,
          service_radius_miles,
          full_street_address,
          postal_code,
          latitude,
          longitude
        ) VALUES (
          ${listing.title},
          ${listing.description},
          ${listing.city},
          ${listing.state},
          ${listing.price},
          ${listing.listing_type},
          ${listing.booking_mode},
          ${listing.default_start_time},
          ${listing.default_end_time},
          ${listing.display_city},
          ${listing.display_state},
          ${listing.display_zone_label},
          ${listing.service_zone_type},
          ${listing.service_radius_miles},
          ${listing.full_street_address},
          ${listing.postal_code},
          ${listing.latitude},
          ${listing.longitude}
        );
      `;
      console.log(`   ✅ Created: ${listing.title}`);
    }
    
    console.log(`\n🎉 Successfully seeded ${demoListings.length} demo listings!`);
    
    // Verify the count
    const result = await sql`SELECT COUNT(*) as count FROM listings;`;
    console.log(`📊 Total listings in database: ${result[0].count}`);
    
  } catch (error) {
    console.error('❌ Error seeding listings:', error);
    throw error;
  }
}

seedListings()
  .then(() => {
    console.log('\n✨ Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed:', error);
    process.exit(1);
  });
